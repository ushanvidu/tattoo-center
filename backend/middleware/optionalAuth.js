const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

// Unlike auth.js's authMiddleware, this never rejects the request — guest
// checkout must keep working. It just attaches req.user when a valid token
// is present, so routes like order creation can identify a logged-in buyer
// without requiring login.
function optionalAuth(req, _res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, SECRET);
      // Admin tokens are signed with the same secret but carry no `id`.
      // Without this guard a lookup like { _id: req.user.id } would have
      // `undefined` stripped by Mongoose and match an unrelated customer.
      if (payload && payload.id) req.user = payload;
    } catch { /* ignore invalid/expired token */ }
  }
  next();
}

module.exports = optionalAuth;
