import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

const PORT = process.env.PORT || 8000;
const CONNECTION_URL = process.env.CONNECTION_URL;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    API: '✅',
  });
});

app.post('/csv', upload.single('csv'), (req, res) => {
  console.log(req.file.buffer.toString());

  const results = [];

  // Use csv-parser to parse the uploaded file
  req.file.buffer
    .toString()
    .split('\n')
    .forEach((line) => {
      const row = line.split(',');
      results.push(row);
    });

  res.status(200).json({
    data: results,
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: 'Invalid File Type' });
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port:${PORT}`);
});
