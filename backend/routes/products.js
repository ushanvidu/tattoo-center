const router    = require('express').Router();
const Product   = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');

// Public: list with filters
router.get('/', async (req, res) => {
  try {
    const { cat, brand, skill, maxPrice, sort, search, tags } = req.query;
    const q = {};
    if (cat)      q.cat    = { $in: cat.split(',') };
    if (brand)    q.brand  = { $in: brand.split(',') };
    if (skill)    q.skill  = { $in: skill.split(',') };
    if (maxPrice) q.price  = { $lte: Number(maxPrice) };
    if (tags)     q.tags   = { $in: tags.split(',') };
    if (search)   q.$or    = [
      { name:      { $regex: search, $options: 'i' } },
      { highlight: { $regex: search, $options: 'i' } },
    ];

    let sortOpt = {};
    if (sort === 'low')    sortOpt = { price: 1 };
    else if (sort === 'high')   sortOpt = { price: -1 };
    else if (sort === 'rating') sortOpt = { rating: -1 };
    else sortOpt = { createdAt: 1 };

    const products = await Product.find(q).sort(sortOpt);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: create product
router.post('/', adminAuth, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: update product
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: delete product
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
