require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // MySQL connection
  const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Svish@12345',
    database: 'auth_app'
  });

  db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected');
  });

  // Registration endpoint
  app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO userdata (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, hashedPassword], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });

  const JWT_SECRET = process.env.JWT_SECRET || "new_project";

  // Login endpoint
  app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM userdata WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: '2h' }
      );
      res.status(200).json({ token, name: user.name });
    });
  });

  // JWT middleware
  const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Unauthorized' });
      req.user = decoded;
      next();
    });
  };

  app.get('/api/verify', verifyToken, (req, res) => {
    res.json({ user: req.user });
  });

  // File Upload with Multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const username = req.user.name.replace(/\s+/g, '_');
      cb(null, `${username}_${Date.now()}${ext}`);
    },
  });
  const upload = multer({ storage });

  app.post('/api/upload', verifyToken, upload.single('document'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ message: 'File uploaded successfully', filename: req.file.filename });
  });

  app.post('/api/bot-reply', (req, res) => {
    const { message } = req.body;
    const reply = `You said: "${message}". I'm still learning to help you better!`;
    res.json({ reply });
  });

  // ✅ Serve React static files *AFTER* all APIs
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

   app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });


  return app;
};

module.exports = { createApp };
