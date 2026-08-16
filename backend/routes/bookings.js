const router    = require('express').Router();
const Booking   = require('../models/Booking');
const adminAuth = require('../middleware/adminAuth');
const optionalAuth = require('../middleware/optionalAuth');

// Public: anyone can request a demo booking. Fields are whitelisted so a
// client can't set `status` (or anything else) on the way in.
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, phone, date, time, mode, product, note } = req.body || {};
    if (!name || !phone || !date || !time) {
      return res.status(400).json({ error: 'Name, phone, date and time are required.' });
    }
    const booking = await Booking.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      date: String(date),
      time: String(time),
      mode: mode ? String(mode) : undefined,
      product: product ? String(product) : undefined,
      note: note ? String(note) : undefined,
      user_id: req.user ? req.user.id : undefined,
      status: 'pending',
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: 'Could not save booking.' });
  }
});

// Admin only — these records hold customer names and phone numbers.
router.get('/', adminAuth, async (_req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Could not load bookings.' });
  }
});

module.exports = router;
