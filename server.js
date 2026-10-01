const express = require("express");
const path = require("path");
const db = require("./database/database");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "FoodBridge API is running" });
});

app.post("/api/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required." });
  }

  db.get("SELECT id FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user) return res.status(409).json({ error: "Email already registered." });

    db.run(
      "INSERT INTO users (name,email,password,role,points) VALUES (?,?,?,?,0)",
      [name, email, password, role],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
          message: "Registration successful.",
          user: { id: this.lastID, name, email, role, points: 0 }
        });
      }
    );
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.get(
    "SELECT id,name,email,role,points FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: "Invalid email or password." });
      res.json({ message: "Login successful.", user });
    }
  );
});

app.get("/api/donations", (req, res) => {
  db.all(
    `SELECT d.*, u.name AS donor_name
     FROM donations d
     JOIN users u ON u.id = d.donor_id
     ORDER BY d.id DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post("/api/donations", (req, res) => {
  const { food_name, category, quantity, location, expiry, description, donor_id } = req.body;

  if (!food_name || !category || !quantity || !location || !expiry || !donor_id) {
    return res.status(400).json({ error: "Please fill all required fields." });
  }

  db.run(
    `INSERT INTO donations
     (food_name,category,quantity,location,expiry,description,donor_id,status)
     VALUES (?,?,?,?,?,?,?,'Available')`,
    [food_name, category, quantity, location, expiry, description || "", donor_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.run("UPDATE users SET points = points + 10 WHERE id = ?", [donor_id]);
      res.status(201).json({
        message: "Food donation listed successfully.",
        id: this.lastID
      });
    }
  );
});

app.put("/api/donations/:id/claim", (req, res) => {
  const donationId = req.params.id;
  const { user_id } = req.body;

  if (!user_id) return res.status(400).json({ error: "User is required." });

  db.get("SELECT * FROM donations WHERE id = ?", [donationId], (err, donation) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!donation) return res.status(404).json({ error: "Donation not found." });

    if (donation.status !== "Available") {
      return res.status(400).json({ error: "This donation is already claimed." });
    }

    db.run(
      "UPDATE donations SET status='Claimed', claimed_by=? WHERE id=?",
      [user_id, donationId],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(
          "INSERT INTO claims (donation_id,user_id) VALUES (?,?)",
          [donationId, user_id]
        );

        db.run("UPDATE users SET points = points + 10 WHERE id = ?", [user_id]);

        res.json({ message: "Donation claimed successfully." });
      }
    );
  });
});

app.put("/api/donations/:id/complete", (req, res) => {
  db.run(
    "UPDATE donations SET status='Completed' WHERE id=?",
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (!this.changes) return res.status(404).json({ error: "Donation not found." });
      res.json({ message: "Donation marked as completed." });
    }
  );
});

app.get("/api/stats", (req, res) => {
  db.get(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status='Available' THEN 1 ELSE 0 END) AS available,
      SUM(CASE WHEN status='Claimed' THEN 1 ELSE 0 END) AS claimed,
      SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) AS completed,
      COALESCE(SUM(CAST(quantity AS INTEGER)),0) AS rescued
     FROM donations`,
    [],
    (err, stats) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(stats);
    }
  );
});

app.get("/api/users/:id/activity", (req, res) => {
  const id = req.params.id;

  db.all(
    "SELECT * FROM donations WHERE donor_id=? ORDER BY id DESC",
    [id],
    (err, donations) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all(
        `SELECT d.* FROM donations d
         JOIN claims c ON c.donation_id=d.id
         WHERE c.user_id=? ORDER BY d.id DESC`,
        [id],
        (err, claimed) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ donations, claimed });
        }
      );
    }
  );
});


app.listen(PORT, () => {
  console.log(`FoodBridge running at http://localhost:${PORT}`);
});
