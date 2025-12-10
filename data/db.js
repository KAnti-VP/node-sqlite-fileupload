import Database from "better-sqlite3";

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

export default imgDB;