const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  phone:   { type: String, required: true },
  mode:    { type: String, enum: ['whatsapp', 'studio'], default: 'whatsapp' },
  date:    String,
  time:    String,
  product: String,
  note:    String,
  // Set server-side from the auth token when the booker is signed in, so
  // bookings can be tied back to an account.
  user_id: String,
  status:  { type: String, default: 'pending', enum: ['pending', 'confirmed', 'done', 'cancelled'] },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
