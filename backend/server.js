const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/admin.html')));

// Handle song request submission
app.post('/send', (req, res) => {
  const { youtube_link } = req.body;

  try {
    db.prepare('INSERT INTO requests (youtube_link) VALUES (?)').run(youtube_link);
    io.emit('new_song', { link: youtube_link });
    res.sendStatus(200);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send('Database error');
  }
});

// Get all requests
app.get('/requests', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM requests ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send('Database error');
  }
});

// Handle 404 errors
app.use((req, res) => res.status(404).send('404 - Page Not Found'));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
