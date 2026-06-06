const router = require('express').Router();
const Product = require('../models/Product');

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

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
