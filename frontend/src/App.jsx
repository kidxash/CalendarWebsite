import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ title: '', date: '', description: '', attachment: null });
  const [activeTab, setActiveTab] = useState('upcoming');
  const [editingId, setEditingId] = useState(null);
  
  const [analysisDate, setAnalysisDate] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api'; 
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for S3

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Handle file input changes
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > MAX_FILE_SIZE) {
        alert("File is too large. Please upload a file smaller than 5MB.");
        e.target.value = null; 
        return;
      }

      setFormData({ ...formData, attachment: file });
    }
  }

  // Handle form submission for adding/editing events
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('date', formData.date);
    data.append('description', formData.description || '');
    
    if (formData.attachment) {
      data.append('attachment', formData.attachment);
    }

    try {
      const submitButton = document.activeElement;
      if(submitButton) submitButton.disabled = true;

      let response;
      if (editingId) {
        response = await fetch(`${API_BASE_URL}/events/${editingId}`, {
          method: 'PUT',
          body: data,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/events`, {
          method: 'POST',
          body: data,
        });
      }

      if (response.ok) {
        await fetchEvents();
        handleCancelEdit();
      } else {
        alert('Failed to save event. Please try again.');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('An error occurred while communicating with the server.');
    }
  };

  // Handle event deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== id));
        if (editingId === id) handleCancelEdit();
      } else {
        console.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Handle editing an event
  const handleEdit = (event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      date: event.date,
      description: event.description || '',
      attachment: null 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', date: '', description: '', attachment: null });
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = null;
  };

  // Handle Busy Day Analysis
  const handleAnalyze = async () => {
    if (!analysisDate) return;

    try {
      setAnalyzing(true);
      const response = await fetch(`${API_BASE_URL}/events/analyze?date=${analysisDate}`);
      
      if (response.ok) {
        const data = await response.json();
        const count = data.count; 
        const eventsList = data.events;

        let intensity = "";
        let colorClass = "";

        if (count <= 2) {
          intensity = "Low Intensity / Free Day";
          colorClass = "text-teal"; 
        } else if (count <= 4) {
          intensity = "Moderate Workload";
          colorClass = "text-terra"; 
        } else {
          intensity = "High Intensity / Busy Day";
          colorClass = "text-rust"; 
        }

        setAnalysisResult({ intensity, count, colorClass, list: eventsList });
      }
    } catch (error) {
      console.error('Error analyzing schedule:', error);
      setAnalysisResult(null);
    } finally {
      setAnalyzing(false);
    }
  };

  // Filter and sort events based on active tab
  const today = new Date().toISOString().split('T')[0];
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const displayedEvents = activeTab === 'upcoming' 
    ? sortedEvents.filter(event => event.date >= today) 
    : sortedEvents.filter(event => event.date < today);

  const editingEvent = events.find(e => e.id === editingId);

  return (
    <div className="bg-charcoal min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-2xl bg-beige rounded-xl shadow-2xl p-6 sm:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-charcoal">My Calendar</h1>
        </header>

        {/* Busy Day Analyzer */}
        <section className="mb-8 p-6 bg-white/50 border border-teal rounded-xl">
          <h2 className="text-lg font-bold text-teal mb-4">Busy Day Analyzer</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              className="flex-grow px-4 py-2 border border-teal rounded-lg focus:ring-2 focus:ring-teal focus:outline-none bg-white text-charcoal"
              value={analysisDate}
              onChange={(e) => setAnalysisDate(e.target.value)}
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-6 py-2 bg-teal text-white font-semibold rounded-lg hover:bg-charcoal transition shadow-md disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Schedule'}
            </button>
          </div>

          {analysisResult && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-teal">
              <p className="text-sm text-charcoal">Result for {analysisDate}:</p>
              <p className={`text-xl font-bold ${analysisResult.colorClass} mt-1`}>
                {analysisResult.intensity.toUpperCase()}
              </p>
              <p className="text-sm text-charcoal mt-1">
                You have <span className="font-semibold">{analysisResult.count}</span> events scheduled.
              </p>
              {analysisResult.list && analysisResult.list.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-charcoal/80">
                  {analysisResult.list.map(e => <li key={e.id}>{e.title}</li>)}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* Add/Edit Event Form */}
        <section className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-charcoal">
              {editingId ? 'Edit Event' : 'Add New Event'}
            </h2>
            {editingId && (
              <button onClick={handleCancelEdit} className="text-sm text-rust hover:underline">
                Cancel Edit
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                name="title" 
                placeholder="Event Title" 
                value={formData.title} 
                onChange={handleChange} 
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none transition" 
                required 
              />
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none transition" 
                required 
              />
            </div>
            <textarea 
              name="description" 
              placeholder="Description (optional)" 
              value={formData.description} 
              onChange={handleChange} 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none resize-none transition" 
            />
            
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input 
                  id="fileInput" 
                  type="file" 
                  onChange={handleFileChange} 
                  className="w-full text-sm text-charcoal file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal file:text-white file:font-semibold hover:file:bg-charcoal cursor-pointer" 
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full sm:w-auto px-6 py-2 text-white font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50 ${editingId ? 'bg-teal hover:bg-charcoal' : 'bg-terra hover:bg-rust'}`}
                >
                  {editingId ? 'Update Event' : 'Add Event'}
                </button>
              </div>
              
              {/* Show S3 attachment while editing*/}
              {editingId && editingEvent?.attachmentUrl && !formData.attachment && (
                <div className="text-xs text-charcoal pl-2 bg-gray-50 p-2 rounded border border-gray-200 inline-block w-fit">
                  <span className="font-semibold">Current Attachment: </span>
                  <a 
                    href={editingEvent.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-teal underline hover:text-charcoal"
                  >
                    View File
                  </a>
                  <span className="ml-2 text-gray-500 italic">(Upload new file to replace)</span>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Tabs */}
        <div className="flex border-b border-gray-300 mb-6">
          <button 
            className={`flex-1 py-2 font-medium transition-colors ${activeTab === 'upcoming' ? 'border-b-2 border-teal text-teal' : 'text-charcoal hover:text-teal'}`} 
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`flex-1 py-2 font-medium transition-colors ${activeTab === 'past' ? 'border-b-2 border-teal text-teal' : 'text-charcoal hover:text-teal'}`} 
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </div>

        {/* Event List */}
        {loading && !events.length ? (
          <div className="text-center py-8">
            <p className="text-charcoal animate-pulse">Loading calendar...</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {displayedEvents.length > 0 ? displayedEvents.map(event => (
              <li key={event.id} className={`bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-all flex justify-between items-start ${editingId === event.id ? 'border-teal ring-1 ring-teal' : 'border-gray-200'}`}>
                <div>
                  <h3 className="font-bold text-lg text-charcoal">{event.title}</h3>
                  <p className="text-sm text-teal font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                  </p>
                  {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
                  
                  {/* S3 Attachment Link */}
                  {event.attachmentUrl && (
                    <div className="flex items-center gap-2 mt-2 p-1.5 bg-gray-50 rounded border border-gray-200 text-xs text-charcoal w-fit">
                      <a href={event.attachmentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-teal font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span>View Attachment</span>
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleEdit(event)}
                    className="text-teal hover:text-charcoal font-semibold text-sm px-2 py-1 rounded hover:bg-teal/10 transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(event.id)} 
                    className="text-rust hover:text-terra font-semibold text-sm px-2 py-1 rounded hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            )) : (
              <div className="text-center py-8">
                <p className="text-charcoal opacity-70">No {activeTab} events found.</p>
              </div>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;