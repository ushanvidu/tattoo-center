const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  cat:       { type: String, required: true },
  sub:       { type: String, required: true },
  price:     { type: Number, required: true },
  old:       Number,
  rating:    { type: Number, default: 4.7 },
  reviews:   { type: Number, default: 40 },
  stock:     { type: String, default: 'In stock' },
  skill:     { type: String, default: 'All' },
  brand:     String,
  highlight: String,
  description: { type: String, default: '' },
  tags:      [String],
  specs:     mongoose.Schema.Types.Mixed,

  /* ── Media ─────────────────────── */
  thumbnail: { type: String, default: '' },   // primary image URL / path
  images:    { type: [String], default: [] },  // gallery images
  videoUrl:  { type: String, default: '' },    // YouTube URL or /uploads/video.mp4
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
