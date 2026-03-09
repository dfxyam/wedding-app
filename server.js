require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

console.log("DB_PASSWORD is loaded as:", process.env.DB_PASSWORD);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for submitting RSVP
app.post('/api/rsvp', async (req, res) => {
  try {
    const { name, attendance_count } = req.body;
    
    if (!name || attendance_count == null) {
      return res.status(400).json({ error: 'Name and attendance count are required' });
    }

    const result = await db.query(
      'INSERT INTO rsvps (name, attendance_count) VALUES ($1, $2) RETURNING *',
      [name, attendance_count]
    );

    res.status(201).json({ 
      message: 'RSVP submitted successfully', 
      data: result.rows[0] 
    });
  } catch (err) {
    console.error('Error saving RSVP:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// API endpoint for fetching all RSVPs
app.get('/api/rsvps', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM rsvps ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching RSVPs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin page route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
