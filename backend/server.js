require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const mongoose = require('mongoose');

const app = express();
app.set('trust proxy', 1); // Render sits behind a reverse proxy — needed for correct req.protocol

// FRONTEND_URL may be a single origin or a comma-separated list (e.g. your
// production Vercel domain + a preview deployment URL).
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(o => o.trim()).filter(Boolean);
// Any localhost/127.0.0.1 port is fine in development (Vite may pick 5173/5174/5175…).
const isLocalDev = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || isLocalDev(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));
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
