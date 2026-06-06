const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  phone:   { type: String, required: true },
  mode:    { type: String, enum: ['whatsapp', 'studio'], default: 'whatsapp' },
  date:    String,
  time:    String,
  product: String,
  status:  { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
