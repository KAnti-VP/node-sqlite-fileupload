import express from "express";
import multer from "multer";
import Database from "better-sqlite3";

const app = express();
const imgDB = new Database("./data/images.sqlite");
imgDB
  .prepare(
    `
  CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT,
      mimetype TEXT
    )`
  )
  .run();

// Middleware
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Multer konfiguration
const upload = multer({ storage: multer.memoryStorage() });

// Feltöltés kezelése
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const base64Image = fileBuffer.toString("base64");
    imgDB.prepare("INSERT INTO images (image, mimetype) VALUES (?, ?)").run(
      base64Image,
      req.file.mimetype
    );
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Server error " + err);
  }
});

// Képek megjelenítése
app.get("/", (req, res) => {
  try {
    const images = imgDB.prepare("SELECT * FROM images").all();
    res.render("index", { images: images });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Kép törlése
app.post("/delete/:id", (req, res) => {
  try {
    const id = +req.params.id;
    imgDB.prepare("DELETE FROM images WHERE id = ?").run(id);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Szerver indítása
app.listen(3000, () =>
  console.log("Szerver fut a http://localhost:3000 címen")
);
