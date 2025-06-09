const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

// Use /tmp for uploaded files (compatible with Render)
const uploadDir = '/tmp';
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static(uploadDir));

app.get('/', (req, res) => {
  res.send(`
    <h2>Upload an Image to Generate a QR Code</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="image" accept="image/*" required />
      <button type="submit">Generate QR</button>
    </form>
  `);
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const qrCode = await QRCode.toDataURL(imageUrl);

    res.send(`
      <h2>Scan to View Image</h2>
      <img src="${qrCode}" alt="QR Code" />
      <p><a href="${imageUrl}" target="_blank">Open Image Directly</a></p>
      <p><a href="/">Upload Another</a></p>
    `);
  } catch (err) {
    console.error('[QR ERROR]', err);
    res.status(500).send('❌ Failed to generate QR code.<br><pre>' + err.message + '</pre>');
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
