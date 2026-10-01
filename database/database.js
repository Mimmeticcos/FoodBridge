const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "..", "foodbridge.db")
);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      points INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity TEXT NOT NULL,
      location TEXT NOT NULL,
      expiry TEXT NOT NULL,
      description TEXT,
      donor_id INTEGER NOT NULL,
      status TEXT DEFAULT 'Available',
      claimed_by INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donation_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO users (name,email,password,role,points) VALUES
        ('Demo Donor','donor@foodbridge.com','1234','Donor',20),
        ('Demo Volunteer','volunteer@foodbridge.com','1234','Volunteer',10),
        ('Demo NGO','ngo@foodbridge.com','1234','NGO',0)
      `);
    }
  });

  db.get("SELECT COUNT(*) AS count FROM donations", (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO donations
        (food_name,category,quantity,location,expiry,description,donor_id,status)
        VALUES
        ('Fresh Vegetable Meals','Cooked Food','25','Coimbatore',
         '2026-10-01 20:00',
         'Fresh meals available for evening distribution.',1,'Available'),

        ('Bread & Bakery Items','Bakery','15','Singanallur',
         '2026-10-01 18:00',
         'Packed bakery items from today.',1,'Available'),

        ('Rice and Curry','Cooked Food','30','Gandhipuram',
         '2026-10-02 14:00',
         'Homestyle rice meals for community rescue.',1,'Available')
      `);
    }
  });
});

module.exports = db;
