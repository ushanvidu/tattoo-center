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
  discount:      { type: Number, default: 0 },
  // Only the verified PayHere webhook may move this off 'pending'.
  status:        { type: String, default: 'pending', enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] },
  contact:       { name: String, phone: String, email: String },
  paymentMethod: { type: String, default: 'koko' },
  // Fields actually sent by CheckoutPage's createOrder() — were previously
  // silently dropped by Mongoose since they weren't in the schema.
  name:          String,
  email:         String,
  phone:         String,
  address:       String,
  city:          String,
  user_id:       String,
  payhere_id:    String,
  payment_method: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
