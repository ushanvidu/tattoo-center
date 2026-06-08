const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  name:       { type: String, default: 'Anonymous' },
  email:      { type: String, default: '' },
  question:   { type: String, required: true },
  answer:     { type: String, default: '' },
  answeredAt: { type: Date },
  status:     { type: String, default: 'pending' },
  public:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
