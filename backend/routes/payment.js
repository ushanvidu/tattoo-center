const express = require('express');
const crypto  = require('crypto');
const router  = express.Router();

const MERCHANT_ID     = process.env.PAYHERE_MERCHANT_ID     || 'TEST_MERCHANT';
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || 'TEST_SECRET';
const SANDBOX         = process.env.PAYHERE_SANDBOX !== 'false';

// POST /api/payment/payhere-hash
// Frontend calls this to get the hash before initiating PayHere checkout
router.post('/payhere-hash', (req, res) => {
  const { order_id, amount, currency = 'LKR' } = req.body;
  if (!order_id || amount === undefined)
    return res.status(400).json({ error: 'order_id and amount are required' });

  const amountStr  = Number(amount).toFixed(2);
  const secretHash = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();
  const hash       = crypto.createHash('md5')
    .update(MERCHANT_ID + order_id + amountStr + currency + secretHash)
    .digest('hex');

  res.json({ hash, merchant_id: MERCHANT_ID, sandbox: SANDBOX });
});

// POST /api/payment/payhere-notify
// PayHere calls this webhook after a payment attempt
router.post('/payhere-notify', express.urlencoded({ extended: false }), (req, res) => {
  const {
    merchant_id, order_id, payhere_amount,
    payhere_currency, status_code, md5sig,
  } = req.body;

  const secretHash = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();
  const expected   = crypto.createHash('md5')
    .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretHash)
    .digest('hex');

  if (md5sig !== expected) return res.sendStatus(400);

  // status_code 2 = successful payment
  if (status_code === '2') {
    const Order = require('../models/Order');
    Order.findByIdAndUpdate(order_id, {
      status:     'paid',
      payhere_id: req.body.payment_id || '',
    }).catch(() => {});
  }

  res.sendStatus(200);
});

// POST /api/payment/koko-create
// Placeholder for Koko BNPL order creation (integrate with Koko API once merchant account is ready)
router.post('/koko-create', (req, res) => {
  const { order_id, amount, customer } = req.body;
  if (!order_id || !amount) return res.status(400).json({ error: 'order_id and amount required' });

  // TODO: Replace with actual Koko API call once merchant credentials are obtained from koko.lk
  res.json({
    success: true,
    redirect_url: null,
    message: 'Koko integration pending merchant account activation',
  });
});

module.exports = router;
