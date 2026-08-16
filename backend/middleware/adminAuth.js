const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET must be set — refusing to start with a fallback secret.');

function adminAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  // Customer tokens are signed with this same secret, so a valid signature
  // alone is NOT proof of admin — the role must be checked explicitly.
  if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  req.admin = payload;
  next();
}

module.exports = adminAuth;
