const express = require('express');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const port = 3000;

// Setup storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // upload folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the upload form
app.get('/', (req, res) => {
  res.send(`
    <h1>Upload Image to Generate QR Code</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="image" accept="image/*" required />
      <button type="submit">Upload and Generate</button>
    </form>
  `);
});

// Handle image upload and generate QR code linking directly to the image file
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const directImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const qrCode = await QRCode.toDataURL(directImageUrl);

    res.send(`
      <h2>Your QR Code (Scan to view image directly):</h2>
      <img src="${qrCode}" alt="QR Code" />
      <p><a href="${directImageUrl}" target="_blank">Open Image Directly</a></p>
      <p><a href="/">Upload Another</a></p>
    `);
  } catch (err) {
    res.status(500).send('Error generating QR code');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
