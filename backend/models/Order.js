const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    productId: String,
    name:      String,
    price:     Number,
    qty:       Number,
    sub:       String,
  }],
  total:         Number,
  status:        { type: String, default: 'pending' },
  contact:       { name: String, phone: String, email: String },
  paymentMethod: { type: String, default: 'koko' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
