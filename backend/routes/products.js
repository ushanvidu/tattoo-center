const router    = require('express').Router();
const Product   = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');

// Fields searched for free-text queries, roughly in priority order.
const SEARCH_FIELDS = ['name', 'brand', 'sub', 'tags', 'highlight', 'description'];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Cheap relevance score used to rank regex hits (name match > brand/sub/tag > body text).
function relevance(product, search) {
  const q = search.toLowerCase();
  const name = (product.name || '').toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if ((product.brand || '').toLowerCase().includes(q) || (product.sub || '').toLowerCase().includes(q)) return 40;
  if ((product.tags || []).some(t => t.toLowerCase().includes(q))) return 30;
  return 10;
}

// Public: list with filters
router.get('/', async (req, res) => {
  try {
    const { cat, brand, skill, maxPrice, sort, search, tags, limit } = req.query;
    const q = {};
    if (cat)      q.cat    = { $in: cat.split(',') };
    if (brand)    q.brand  = { $in: brand.split(',') };
    if (skill)    q.skill  = { $in: skill.split(',') };
    if (maxPrice) q.price  = { $lte: Number(maxPrice) };
    if (tags)     q.tags   = { $in: tags.split(',') };
    if (search) {
      const re = { $regex: escapeRegex(search), $options: 'i' };
      q.$or = SEARCH_FIELDS.map(field => ({ [field]: re }));
    }

    let sortOpt = {};
    if (sort === 'low')    sortOpt = { price: 1 };
    else if (sort === 'high')   sortOpt = { price: -1 };
    else if (sort === 'rating') sortOpt = { rating: -1 };
    else if (!search) sortOpt = { createdAt: 1 };

    // The gallery `images` array holds full base64 data URIs — leave it out of
    // list responses (ProductCard only needs `thumbnail`); the single-product
    // route below returns it in full.
    let query = Product.find(q).select('-images').sort(sortOpt);
    let products = await query;

    if (search && !sort) {
      products = products
        .map(p => ({ p, s: relevance(p, search) }))
        .sort((a, b) => b.s - a.s)
        .map(x => x.p);
    }
    if (limit) products = products.slice(0, Number(limit));

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
