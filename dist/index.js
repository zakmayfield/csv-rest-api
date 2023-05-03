"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const pg_1 = __importDefault(require("pg"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { Pool } = pg_1.default;
const PORT = process.env.PORT || 8000;
const CONNECTION_URL = process.env.CONNECTION_URL;
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.status(200).json({
        API: '✅',
    });
});
app.post('/csv', upload.single('csv'), async (req, res) => {
    // console.log(req.file.buffer.toString());
    const results = [];
    req.file.buffer
        .toString()
        .split('\n')
        .forEach((line, index) => {
        if (index === 0)
            return;
        const row = line.split(',');
        results.push(row);
    });
    const pool = new Pool({ connectionString: CONNECTION_URL });
    const client = await pool.connect();
    try {
        for await (const row of results) {
            const { name, email, phone } = row;
            console.log(row);
            await client.query('INSERT INTO users (name, email, phone) VALUES ($1, $2, $3)', [name, email, phone]);
        }
    }
    catch (err) {
        console.log('error', err);
    }
    finally {
        await client.release();
        await pool.end();
    }
    res.status(200).json({
        data: results,
    });
});
app.use((err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        res.status(400).json({ error: 'Invalid File Type' });
    }
    else {
        next();
    }
});
app.listen(PORT, () => {
    console.log(`Server listening on port:${PORT}`);
});
//# sourceMappingURL=index.js.map