const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  text:    { type: String, required: true },
  link:    { type: String, default: '' },
  linkLabel: { type: String, default: '' },
  type:    { type: String, default: 'info', enum: ['info', 'promo', 'new', 'urgent'] },
  active:  { type: Boolean, default: true },
  order:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
