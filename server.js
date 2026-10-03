const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. AUTH & PROFILE MANAGEMENT
// ==========================================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'User already exists!' });

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role || 'Student']
    );
    res.json({ message: 'Registration Successful!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (users.length === 0) return res.status(401).json({ message: 'Invalid Credentials' });

    res.json({ message: 'Login Successful!', user: users[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE PROFILE (Name, Education, Image)
app.put('/api/users/profile', async (req, res) => {
  const { userId, name, education, profilePic } = req.body;
  try {
    await db.query(
      'UPDATE users SET name = ?, education = ?, profile_pic = ? WHERE id = ?',
      [name, education, profilePic, userId]
    );
    res.json({ message: 'Profile updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
});

// GET USER DETAILS
app.get('/api/users/:id', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, education, profile_pic FROM users WHERE id = ?', [req.params.id]);
    res.json(users[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. DYNAMIC LEADERBOARD & QUIZ API
// ==========================================

// GET DYNAMIC LEADERBOARD (SORTED BY HIGHEST SCORE / PERCENTAGE)
app.get('/api/submissions', async (req, res) => {
  try {
    const query = `
      SELECT
        s.id,
        u.name AS studentName,
        q.subject,
        s.score,
        s.total_marks AS totalMarks,
        ROUND((s.score / s.total_marks) * 100, 2) AS percentage,
        IF((s.score / s.total_marks) >= 0.4, 'Passed', 'Failed') AS status
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN quizzes q ON s.quiz_id = q.id
      ORDER BY percentage DESC, s.score DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
});

// GET QUIZZES
app.get('/api/quizzes', async (req, res) => {
  try {
    const [quizzes] = await db.query('SELECT * FROM quizzes ORDER BY created_at DESC');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUBLISH QUIZ
app.post('/api/quizzes', async (req, res) => {
  const { subject, topic, duration, expiryTime, questions } = req.body;
  try {
    const [quizResult] = await db.query(
      'INSERT INTO quizzes (subject, topic, duration, expiryTime) VALUES (?, ?, ?, ?)',
      [subject, topic, duration, expiryTime]
    );
    res.json({ message: 'Quiz published successfully!', quizId: quizResult.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));