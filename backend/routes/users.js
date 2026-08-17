const router    = require('express').Router();
const User      = require('../models/User');
const Order     = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');

// GET /api/users — registered customers, for the admin panel.
// Admin only: this is the customer list, including contact details.
// Password hashes are never selected, let alone returned.
router.get('/', adminAuth, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const q = {};
    if (typeof search === 'string' && search.trim()) {
      const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = { $regex: safe, $options: 'i' };
      q.$or = [{ fullName: re }, { email: re }, { phone: re }];
    }

    const users = await User.find(q)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Attach spend/order counts so the list is useful for deciding who to
    // contact, not just a dump of email addresses.
    const stats = await Order.aggregate([
      { $match: { user_id: { $ne: null } } },
      { $group: {
          _id: '$user_id',
          orders: { $sum: 1 },
          paidOrders: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          spent: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$total', 0] } },
          lastOrderAt: { $max: '$createdAt' },
        } },
    ]).catch(() => []);

    const byUser = Object.fromEntries(stats.map(s => [String(s._id), s]));
    const rows = users.map(u => {
      const s = byUser[String(u._id)] || {};
      return {
        ...u,
        orders:      s.orders      || 0,
        paidOrders:  s.paidOrders  || 0,
        spent:       s.spent       || 0,
        lastOrderAt: s.lastOrderAt || null,
      };
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load customers.' });
  }
});

module.exports = router;
