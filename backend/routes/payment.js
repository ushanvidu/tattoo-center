const express      = require('express');
const crypto       = require('crypto');
const router       = express.Router();
const optionalAuth = require('../middleware/optionalAuth');
const Order        = require('../models/Order');
const User         = require('../models/User');

const MERCHANT_ID     = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
const SANDBOX         = process.env.PAYHERE_SANDBOX !== 'false';

const secretHash = () =>
  crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();

// POST /api/payment/payhere-hash
// Signs the amount PayHere will charge. The amount is read from the order in
// the database — never from the request — so a client cannot ask us to sign a
// cheaper price than the goods actually cost.
router.post('/payhere-hash', optionalAuth, async (req, res) => {
  try {
    if (!MERCHANT_ID || !MERCHANT_SECRET) {
      return res.status(503).json({ error: 'Payment is not configured yet.' });
    }
    const { orderId, currency = 'LKR' } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });

    const order = await Order.findById(orderId).catch(() => null);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(409).json({ error: 'This order has already been processed.' });
    }

    const amountStr = Number(order.total).toFixed(2);
    const hash = crypto.createHash('md5')
      .update(MERCHANT_ID + String(order._id) + amountStr + currency + secretHash())
      .digest('hex');

    res.json({
      hash,
      merchant_id: MERCHANT_ID,
      sandbox: SANDBOX,
      order_id: String(order._id),
      amount: amountStr,
      currency,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not prepare payment.' });
  }
});

// POST /api/payment/payhere-notify
// PayHere's server-to-server callback. This is the ONLY place an order becomes
// 'paid' — the browser is never trusted for that, so closing the tab after
// paying can no longer lose the order.
router.post('/payhere-notify', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    const {
      merchant_id, order_id, payhere_amount,
      payhere_currency, status_code, md5sig,
    } = req.body || {};

    const expected = crypto.createHash('md5')
      .update(String(merchant_id) + String(order_id) + String(payhere_amount) +
              String(payhere_currency) + String(status_code) + secretHash())
      .digest('hex')
      .toUpperCase();

    if (String(md5sig).toUpperCase() !== expected) return res.sendStatus(403);
    if (String(merchant_id) !== String(MERCHANT_ID)) return res.sendStatus(403);

    // status_code 2 = success. Anything else is a failed/cancelled attempt.
    if (String(status_code) !== '2') return res.sendStatus(200);

    const order = await Order.findById(order_id).catch(() => null);
    if (!order) return res.sendStatus(200);          // nothing to reconcile
    if (order.status === 'paid') return res.sendStatus(200);  // idempotent replay

    // The amount actually charged must match what we priced.
    if (Number(payhere_amount).toFixed(2) !== Number(order.total).toFixed(2)) {
      return res.sendStatus(200);
    }

    order.status     = 'paid';
    order.payhere_id = req.body.payment_id || '';
    await order.save();

    // Consume the one-time signup discount only now that money has arrived —
    // abandoning checkout no longer burns it.
    if (order.discount > 0 && order.user_id) {
      await User.findOneAndUpdate(
        { _id: order.user_id, signupDiscountUsed: false },
        { signupDiscountUsed: true }
      ).catch(() => {});
    }

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(200); // never make PayHere retry forever on our bug
  }
});

// POST /api/payment/koko-create
// Placeholder for Koko BNPL — not wired to a merchant account yet.
router.post('/koko-create', (_req, res) => {
  res.status(503).json({
    success: false,
    message: 'Koko payments are not available yet.',
  });
});

module.exports = router;
