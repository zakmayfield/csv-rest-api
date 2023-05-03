import express from 'express';
import multer from 'multer';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
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

app.post('/csv', upload.single('csv'), async (req, res) => {
  const results = [];

  req.file.buffer
    .toString()
    .split('\n')
    .forEach((line, index) => {
      if (index === 0) return;
      const row = line.split(',');
      results.push(row);
    });

  const pool = new Pool({ connectionString: CONNECTION_URL });
  const client = await pool.connect();

  try {
    for await (const row of results) {
      const [name, email, phone] = row;
      console.log(name);
      await client.query(
        'INSERT INTO users (name, email, phone) VALUES ($1, $2, $3)',
        [name, email, phone]
      );
    }
  } catch (err) {
    console.log('error', err);
  } finally {
    await client.release();
    await pool.end();
  }

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
