const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const adminAuth = require('../middleware/adminAuth');

const UPLOAD_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_IMG = ['.jpg','.jpeg','.png','.webp','.gif','.svg'];
const ALLOWED_VID = ['.mp4','.webm','.mov','.avi'];
const ALLOWED     = [...ALLOWED_IMG, ...ALLOWED_VID];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    const name = `${Date.now()}_${base}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED.includes(ext)) cb(null, true);
  else cb(new Error(`Unsupported file type: ${ext}`), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

// Single file upload (admin only)
router.post('/', adminAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received.' });
  const ext  = path.extname(req.file.filename).toLowerCase();
  const type = ALLOWED_IMG.includes(ext) ? 'image' : 'video';
  res.json({
    url:      `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    type,
    size:     req.file.size,
  });
});

// Handle multer errors
router.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || 'Upload failed.' });
});

module.exports = router;
