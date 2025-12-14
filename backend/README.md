# Calendar Website Backend

Express.js backend with MongoDB for the Calendar application.

## Setup Instructions

### 1. Install MongoDB

#### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB and make sure to install MongoDB Compass (GUI tool)
3. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

#### Alternative - MongoDB Atlas (Cloud):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Update `.env` file with your MongoDB Atlas URI:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calendar
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

The `.env` file contains:
```
MONGODB_URI=mongodb://localhost:27017/calendar
PORT=5000
NODE_ENV=development
```

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event (with file upload)
- `PUT /api/events/:id` - Update event (with file upload)
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/analyze/date?date=YYYY-MM-DD` - Analyze busy days

## MongoDB Schema

### Event Model
```javascript
{
  title: String (required),
  date: Date (required),
  description: String,
  attachment: {
    filename: String,
    url: String,
    contentType: String
  },
  timestamps: true (createdAt, updatedAt)
}
```

## File Uploads

- Files are stored in the `uploads/` directory
- Max file size: 5MB
- Allowed types: jpeg, jpg, png, pdf, doc, docx
