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
    const csv = (v) => (typeof v === 'string' && v ? v.split(',').map(x => x.trim()).filter(Boolean) : null);
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

// Public: the brands that actually exist in the catalogue, with product counts.
// The shop's brand filter is built from this, so adding a product with a new
// brand makes that brand appear in the filter with no code change.
// NOTE: must stay above `/:id`, or Express reads "brands" as a product id.
router.get('/brands', async (_req, res) => {
  try {
    const rows = await Product.aggregate([
      { $match: { brand: { $type: 'string', $ne: '' } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(rows.map(r => ({ name: r._id, count: r.count })));
  } catch (err) {
    res.status(500).json({ error: 'Could not load brands.' });
  }
});

// Admin: rename a brand across every product that carries it. Lets the owner
// fix a typo or merge duplicates without editing each product by hand.
router.patch('/brands/:name', adminAuth, async (req, res) => {
  try {
    const from = String(req.params.name || '').trim();
    const to   = String(req.body && req.body.name || '').trim();
    if (!from) return res.status(400).json({ error: 'Current brand name is required.' });
    if (!to)   return res.status(400).json({ error: 'New brand name is required.' });
    if (to.length > 80) return res.status(400).json({ error: 'Brand name is too long.' });

    // Renaming onto an existing brand merges the two, which is intentional.
    const result = await Product.updateMany({ brand: from }, { $set: { brand: to } });
    if (!result.matchedCount) return res.status(404).json({ error: 'No products use that brand.' });
    res.json({ from, to, updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: 'Could not rename brand.' });
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

// A brand typed with a stray space would otherwise show up as a second,
// separate entry in the shop's brand filter.
function normaliseBrand(body) {
  if (body && typeof body.brand === 'string') body.brand = body.brand.trim();
  return body;
}

// Admin: create product
router.post('/', adminAuth, async (req, res) => {
  try {
    const product = await Product.create(normaliseBrand(req.body));
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: update product
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, normaliseBrand(req.body), { new: true, runValidators: true });
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
