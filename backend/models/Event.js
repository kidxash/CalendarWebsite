const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  attachmentFilename: {
    type: DataTypes.STRING,
    field: 'attachment_filename'
  },
  attachmentUrl: {
    type: DataTypes.STRING,
    field: 'attachment_url'
  },
  attachmentContentType: {
    type: DataTypes.STRING,
    field: 'attachment_content_type'
  }
}, {
  timestamps: true,
  tableName: 'events',
  indexes: [
    {
      fields: ['date']
    }
  ]
});

module.exports = Event;
