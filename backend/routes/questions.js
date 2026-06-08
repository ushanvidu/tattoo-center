const express = require('express');
const Question = require('../models/Question');
const router = express.Router();

// Public: list answered public questions
router.get('/', async (_req, res) => {
  try {
    const questions = await Question.find({ public: true, status: 'answered' })
      .sort({ answeredAt: -1 })
      .select('-email');
    res.json(questions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Public: submit a new question
router.post('/', async (req, res) => {
  try {
    const q = await Question.create({
      name:     req.body.name || 'Anonymous',
      email:    req.body.email || '',
      question: req.body.question,
    });
    res.status(201).json({ message: 'Question submitted. We will answer soon!', id: q._id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: list all questions (pending + answered)
router.get('/admin', async (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: answer a question
router.patch('/:id/answer', async (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const q = await Question.findByIdAndUpdate(
      req.params.id,
      {
        answer:     req.body.answer,
        status:     'answered',
        public:     req.body.public !== false,
        answeredAt: new Date(),
      },
      { new: true }
    );
    if (!q) return res.status(404).json({ error: 'Not found' });
    res.json(q);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: delete a question
router.delete('/:id', async (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
