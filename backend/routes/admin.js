const router = require('express').Router();
const jwt    = require('jsonwebtoken');

const rateLimit = require('express-rate-limit');

// No fallbacks: a missing env var must stop the server, not silently fall back
// to a credential that is published in this repo.
const SECRET   = process.env.JWT_SECRET;
const USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.ADMIN_PASSWORD;
if (!SECRET || !USERNAME || !PASSWORD) {
  throw new Error('JWT_SECRET, ADMIN_USERNAME and ADMIN_PASSWORD must all be set.');
}

// The admin password is a single shared secret, so brute force must be capped.
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', adminLoginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (username !== USERNAME || password !== PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ role: 'admin', username }, SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

router.get('/verify', (req, res) => {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ valid: false });
  try {
    const data = jwt.verify(token, SECRET);
    res.json({ valid: true, username: data.username });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
