const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  phone:    { type: String, default: '' },
  role:     { type: String, default: 'customer', enum: ['customer', 'admin'] },
  signupDiscountUsed: { type: Boolean, default: false },
  // Lets the admin see who is actually active, not just who registered.
  lastLoginAt: Date,
  loginCount:  { type: Number, default: 0 },
}, { timestamps: true });

// Never return the password hash in JSON responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => { delete ret.password; return ret; },
});

module.exports = mongoose.model('User', userSchema);
