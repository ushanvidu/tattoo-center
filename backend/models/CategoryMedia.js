const mongoose = require('mongoose');

const categoryMediaSchema = new mongoose.Schema({
  catId:       { type: String, required: true, unique: true },
  imageUrl:    { type: String, default: '' },
  videoUrl:    { type: String, default: '' },
  bannerText:  { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('CategoryMedia', categoryMediaSchema);
