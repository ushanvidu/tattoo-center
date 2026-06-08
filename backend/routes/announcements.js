const router    = require('express').Router();
const Announcement = require('../models/Announcement');
const adminAuth = require('../middleware/adminAuth');

// Public: get active announcements
router.get('/', async (_req, res) => {
  try {
    const items = await Announcement.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: get all announcements
router.get('/all', adminAuth, async (_req, res) => {
  try {
    const items = await Announcement.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: create
router.post('/', adminAuth, async (req, res) => {
  try {
    const item = await Announcement.create(req.body);
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: update
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: delete
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
