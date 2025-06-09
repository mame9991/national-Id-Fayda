const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

// Use /tmp folder for cloud compatibility (e.g., Render)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
    const filePath = `/tmp/${req.file.filename}`;
    const fileExt = path.extname(req.file.originalname).substring(1);
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = `data:image/${fileExt};base64,${imageBuffer.toString('base64')}`;

    const qrCode = await QRCode.toDataURL(base64Image);

    res.send(`
      <h2>Scan this QR Code to View the Image</h2>
      <img src="${qrCode}" alt="QR Code" />
      <p><a href="/">Upload Another</a></p>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate QR code.');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
