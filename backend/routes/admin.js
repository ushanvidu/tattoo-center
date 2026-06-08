const router = require('express').Router();
const jwt    = require('jsonwebtoken');

const SECRET   = process.env.JWT_SECRET       || 'tc_jwt_secret_2026';
const USERNAME = process.env.ADMIN_USERNAME    || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD    || 'TattooCenter2026!';

router.post('/login', (req, res) => {
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
