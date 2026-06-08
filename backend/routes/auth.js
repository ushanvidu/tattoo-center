const router      = require('express').Router();
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const rateLimit   = require('express-rate-limit');
const User        = require('../models/User');

const SECRET  = process.env.JWT_SECRET || 'tc_jwt_secret_2026_secure';
const BCRYPT_ROUNDS = 12;

// Strict rate limit on auth endpoints — 10 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function makeToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, fullName } = req.body || {};

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password and full name are required.' });
    }

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Password strength: min 8 chars, at least one number
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (!/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user   = await User.create({
      email:    email.toLowerCase().trim(),
      password: hashed,
      fullName: fullName.trim(),
    });

    const token = makeToken(user);
    res.status(201).json({ token, user });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    // Use a constant-time comparison even when user doesn't exist to prevent email enumeration
    const dummyHash = '$2a$12$invalidhashinvalidhashinvalidhas';
    const match = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !match) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = makeToken(user);
    res.json({ token, user });
  } catch (e) {
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── Get current user ─────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// ─── Update profile ───────────────────────────────────────────────────────────
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone } = req.body || {};
    const updates = {};
    if (fullName?.trim()) updates.fullName = fullName.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ─── Change password ──────────────────────────────────────────────────────────
router.patch('/password', authLimiter, authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }
    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must be at least 8 characters and include a number.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

module.exports = router;
