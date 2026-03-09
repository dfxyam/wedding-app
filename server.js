// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); // Tambahkan ini
const db = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIX: Fungsi deteksi path 'public' yang bekerja di Lokal & Vercel
const getStaticPath = () => {
  // Daftar kemungkinan lokasi folder public
  const possiblePaths = [
    path.join(__dirname, "public"), // Lokal: /project/server.js -> /project/public
    path.join(process.cwd(), "public"), // Vercel: cwd biasanya di /var/task
    path.join(__dirname, "..", "public"), // Vercel (api/): /var/task/api -> /var/task/public
    path.join(process.cwd(), "..", "public"), // Fallback lain
  ];

  // Cek satu per satu, return yang pertama ada
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log(`[Static Files] Serving from: ${p}`); // Log untuk debugging
      return p;
    }
  }
  // Fallback terakhir
  return path.join(__dirname, "public");
};

const staticPath = getStaticPath();
app.use(express.static(staticPath));

// ✅ Route: Admin
app.get("/admin", (req, res) => {
  const adminFile = path.join(staticPath, "admin.html");
  if (fs.existsSync(adminFile)) {
    res.sendFile(adminFile);
  } else {
    console.error(`[Error] admin.html not found at: ${adminFile}`);
    res.status(404).send("Admin page not found");
  }
});

// ✅ Route: Root
app.get("/", (req, res) => {
  const indexFile = path.join(staticPath, "index.html");
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.json({ message: "API is running. Frontend not found." });
  }
});

// API endpoint: Submit RSVP
app.post("/api/rsvp", async (req, res) => {
  try {
    const { name, attendance_count } = req.body;

    if (!name || attendance_count == null) {
      return res
        .status(400)
        .json({ error: "Name and attendance count are required" });
    }

    const result = await db.query(
      "INSERT INTO rsvps (name, attendance_count) VALUES ($1, $2) RETURNING *",
      [name, attendance_count],
    );

    res.status(201).json({
      message: "RSVP submitted successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error saving RSVP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoint: Fetch all RSVPs
app.get("/api/rsvps", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM rsvps ORDER BY created_at DESC",
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching RSVPs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ EXPORT app untuk Vercel serverless
module.exports = app;
