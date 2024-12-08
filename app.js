import express from 'express';
import multer from 'multer';
import sqlite3 from 'sqlite3';
// import path from 'path';
// import { unlink } from 'fs/promises';
// import { fileURLToPath } from 'url';

const app = express();
const dbImg = new sqlite3.Database('./data/images.sqlite');
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const imageFolder = [__dirname, 'public', 'images'];

// Middleware
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Multer konfiguration
const upload = multer({ storage: multer.memoryStorage() });

dbImg.serialize(() => {
  dbImg.run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT
    )
  `);
});

// Feltöltés kezelése
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer; // Fájl adatok memóriából
    const base64Image = fileBuffer.toString('base64'); // Konvertálás Base64-re
    dbImg.run('INSERT INTO images (image) VALUES (?)', [base64Image], (err) => {
      if (err) return res.status(500).send('Server error: POST insert into database' + err);
      res.redirect('/');
    });
  } catch (error) {
    res.status(500).send('Upload error');
  }
});

// Képek megjelenítése
app.get('/', (req, res) => {
  dbImg.all('SELECT * FROM images', [], (err, rows) => {
    if (err) return res.status(500).send('Server error');
    res.render('index', { images: rows });
  });
});

// Kép törlése
app.post('/delete/:id', (req, res) => {
  const { id } = req.params;
  dbImg.run('DELETE FROM images WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send('Server error');
    res.redirect('/');
  });
});

// Szerver indítása
app.listen(3000, () => console.log('Szerver fut a http://localhost:3000 címen'));