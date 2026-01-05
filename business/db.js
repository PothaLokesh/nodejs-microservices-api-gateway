import sqlite3 from "sqlite3";
const sqlite3Verbose = sqlite3.verbose();

const db = new sqlite3Verbose.Database(":memory:");

db.serialize(() => {
    db.run(`
    CREATE TABLE items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
    )
  `);
});

export default db;
