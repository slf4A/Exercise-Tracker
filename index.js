const express = require('express');
const app = express();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false })); // supaya bisa parse form data

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Data in-memory
const users = [];

// Create new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const newUser = { username, _id: uuidv4(), exercises: [] };
  users.push(newUser);

  res.json({ username: newUser.username, _id: newUser._id });
});

// Get all users
app.get('/api/users', (req, res) => {
  const list = users.map(u => ({ username: u.username, _id: u._id }));
  res.json(list);
});

// Add exercise to user
app.post('/api/users/:_id/exercises', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { description, duration, date } = req.body;
  if (!description || !duration) return res.status(400).json({ error: 'Description and duration required' });

  const exerciseDate = date ? new Date(date) : new Date();

  const exercise = {
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString()
  };

  user.exercises.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    date: exercise.date,
    duration: exercise.duration,
    description: exercise.description
  });
});

// Get user exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let { from, to, limit } = req.query;
  let log = user.exercises;

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(e => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(e => new Date(e.date) <= toDate);
  }

  if (limit) {
    limit = parseInt(limit);
    if (!isNaN(limit)) log = log.slice(0, limit);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
