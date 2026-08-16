const router       = require('express').Router();
const Order        = require('../models/Order');
const Product      = require('../models/Product');
const adminAuth    = require('../middleware/adminAuth');
const optionalAuth = require('../middleware/optionalAuth');

const SHIPPING = Number(process.env.SHIPPING_FLAT || 350);
const SIGNUP_DISCOUNT_RATE = 0.10;

// Create an order. Guest checkout is supported, so this is not auth-gated —
// but nothing about the money is taken from the client: line prices and the
// total are recomputed from the database, and `status` is always 'pending'.
// Only the PayHere webhook may promote an order to 'paid'.
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, contact, name, email, phone, address, city, paymentMethod, payhere_order_id } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    // Price every line from the catalog, ignoring any price the client sent.
    const priced = [];
    for (const line of items) {
      const id  = line && (line.productId || line._id || line.id);
      const qty = Math.max(1, Math.min(999, parseInt(line && line.qty, 10) || 1));
      if (!id) return res.status(400).json({ error: 'Each item needs a productId.' });
      const product = await Product.findById(id).select('name price sub').catch(() => null);
      if (!product) return res.status(400).json({ error: `Unknown product: ${id}` });
      priced.push({ productId: String(product._id), name: product.name, price: product.price, qty, sub: product.sub });
    }

    const subtotal = priced.reduce((sum, l) => sum + (l.price || 0) * l.qty, 0);

    // The signup discount is granted from the user record, never from the body.
    let discount = 0;
    if (req.user && req.user.id) {
      const User = require('../models/User');
      const buyer = await User.findById(req.user.id).select('signupDiscountUsed').catch(() => null);
      if (buyer && !buyer.signupDiscountUsed) discount = Math.round(subtotal * SIGNUP_DISCOUNT_RATE);
    }

    const order = await Order.create({
      items: priced,
      total: subtotal - discount + SHIPPING,
      discount,
      status: 'pending',
      contact,
      name, email, phone, address, city,
      paymentMethod,
      payhere_order_id,
      user_id: req.user && req.user.id ? req.user.id : undefined,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: 'Could not create order.' });
  }
});

// Admin: all orders
router.get('/', adminAuth, async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Could not load orders.' });
  }
});

// A buyer may read their own order; an admin may read any. Previously this was
// wide open, so anyone with an order id could read the customer's name,
// address and phone number.
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    const isOwner = req.user && req.user.id && order.user_id === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });
    res.json(order);
  } catch (err) {
    res.status(404).json({ error: 'Not found' });
  }
});

// Admin: update order status
const ALLOWED_STATUS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ALLOWED_STATUS.join(', ')}` });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Could not update order.' });
  }
});

module.exports = router;
