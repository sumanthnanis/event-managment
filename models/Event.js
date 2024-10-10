const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  companyName: { type: String, required: true }, // New field for company name
  image: { type: String, required: true }, // New field for image URL
  description: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAdminEvent: { type: Boolean, default: false },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
