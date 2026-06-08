const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  phone:    { type: String, default: '' },
  role:     { type: String, default: 'customer', enum: ['customer', 'admin'] },
}, { timestamps: true });

// Never return the password hash in JSON responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => { delete ret.password; return ret; },
});

module.exports = mongoose.model('User', userSchema);
