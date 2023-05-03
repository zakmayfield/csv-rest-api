"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
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