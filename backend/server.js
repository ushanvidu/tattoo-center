require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const mongoose = require('mongoose');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/upload',        require('./routes/upload'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/categories',    require('./routes/categories'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/questions',     require('./routes/questions'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/payment',      require('./routes/payment'));
app.get('/api/health',        (_req, res) => res.json({ status: 'ok' }));

const PORT      = process.env.PORT     || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-center';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
