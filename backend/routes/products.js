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
    const { cat, brand, skill, maxPrice, sort, search, tags, limit, full } = req.query;
    // Query params arrive as strings; anything else (?cat[$ne]=x, ?cat[]=a)
    // is a client sending an object/array, which used to crash .split().
    const csv = (v) => (typeof v === 'string' && v ? v.split(',') : null);
    const q = {};
    const catList = csv(cat), brandList = csv(brand), skillList = csv(skill), tagList = csv(tags);
    if (catList)   q.cat   = { $in: catList };
    if (brandList) q.brand = { $in: brandList };
    if (skillList) q.skill = { $in: skillList };
    if (tagList)   q.tags  = { $in: tagList };
    if (maxPrice !== undefined && maxPrice !== '') {
      const cap = Number(maxPrice);
      if (!Number.isFinite(cap)) return res.status(400).json({ error: 'maxPrice must be a number.' });
      q.price = { $lte: cap };
    }
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
    // list responses (ProductCard only needs `thumbnail`). The admin panel asks
    // for ?full=1, because editing a product re-submits this object and an
    // omitted gallery would be saved back as an empty array, destroying it.
    const projection = full === '1' ? {} : { images: 0 };
    let products = await Product.find(q, projection).sort(sortOpt);

    if (search && !sort) {
      products = products
        .map(p => ({ p, s: relevance(p, search) }))
        .sort((a, b) => b.s - a.s)
        .map(x => x.p);
    }
    if (limit !== undefined && limit !== '') {
      const n = parseInt(limit, 10);
      if (Number.isFinite(n) && n > 0) products = products.slice(0, n);
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Could not load products.' });
  }
});

// Public: single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).catch(() => null);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: 'Not found' });
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
