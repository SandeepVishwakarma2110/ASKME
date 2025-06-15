// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();}
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const {sql, poolPromise } = require('./db/db');
const { uploadToBlobStorage } = require('./utils/blobupload');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // MySQL connection
  // const db = mysql.createConnection({
  //   host: 'localhost',
  //   user: 'root',
  //   password: 'Svish@12345',
  //   database: 'auth_app'
  // });

  // db.connect((err) => {
  //   if (err) throw err;
  //   console.log('MySQL connected');
  // });
   

  // //test azure sql db
  // async function getUsers() {
  //   const pool = await poolPromise;
  //   const result = await pool.request().query('SELECT * FROM users');
  //   console.log(result.recordset);
  // }
 //test azure sql api
//  app.get('/api/test-users', async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request().query('SELECT * FROM users');
//     res.json(result.recordset);
//   } catch (err) {
//     console.error("❌ Error querying Azure SQL:", err);
//     res.status(500).json({ message: 'Query failed', error: err.message });
//   }
// }); 



  // // Registration endpoint
  // app.post('/register', async (req, res) => {
  //   const { name, email, password } = req.body;
  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   const query = 'INSERT INTO userdata (name, email, password) VALUES (?, ?, ?)';
  //   db.query(query, [name, email, hashedPassword], (err) => {
  //     if (err) {
  //       if (err.code === 'ER_DUP_ENTRY') {
  //         return res.status(400).json({ message: 'Email already exists' });
  //       }
  //       return res.status(500).json({ message: 'Database error' });
  //     }
  //     res.status(201).json({ message: 'User registered successfully' });
  //   });
  // });

    // Registration endpoint azure
    app.post('/register', async (req, res) => {
      const { name, email, password } = req.body;
    
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await poolPromise;
    
        // Check if email already exists
        const checkEmail = await pool.request()
          .input('email', sql.VarChar, email)
          .query('SELECT * FROM users WHERE email = @email');
    
        if (checkEmail.recordset.length > 0) {
          return res.status(400).json({ message: 'Email already exists' });
        }
    
        // Insert user into Azure SQL
        await pool.request()
          .input('name', sql.VarChar, name)
          .input('email', sql.VarChar, email)
          .input('password', sql.VarChar, hashedPassword)
          .query('INSERT INTO users (name, email, password) VALUES (@name, @email, @password)');
    
        res.status(201).json({ message: 'User registered successfully' });
      } catch (err) {
        console.error('❌ Azure SQL Registration Error:', err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
      }
    });
    

  const JWT_SECRET = process.env.JWT_SECRET || "new_project";

  // // Login endpoint
  // app.post('/login', (req, res) => {
  //   const { email, password } = req.body;
  //   const query = 'SELECT * FROM userdata WHERE email = ?';
  //   db.query(query, [email], async (err, results) => {
  //     if (err || results.length === 0) {
  //       return res.status(401).json({ message: 'Invalid email or password' });
  //     }
  //     const user = results[0];
  //     const passwordMatch = await bcrypt.compare(password, user.password);
  //     if (!passwordMatch) {
  //       return res.status(401).json({ message: 'Invalid email or password' });
  //     }
  //     const token = jwt.sign(
  //       { id: user.id, name: user.name, email: user.email },
  //       JWT_SECRET,
  //       { expiresIn: '2h' }
  //     );
  //     res.status(200).json({ token, name: user.name });
  //   });
  // });
  
  // Login endpoint azure
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .query('SELECT * FROM users WHERE email = @email'); // use 'userdata' if that's the table name
  
      const user = result.recordset[0];
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
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
    } catch (error) {
      console.error('Azure SQL Login Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
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
  // const storage = multer.diskStorage({
  //   destination: (req, file, cb) => cb(null, 'uploads/'),
  //   filename: (req, file, cb) => {
  //     const ext = path.extname(file.originalname);
  //     const username = req.user.name.replace(/\s+/g, '_');
  //     cb(null, `${username}_${Date.now()}${ext}`);
  //   },
  // });
  // const upload = multer({ storage });

  // app.post('/api/upload', verifyToken, upload.single('document'), (req, res) => {
  //   if (!req.file) {
  //     return res.status(400).json({ message: 'No file uploaded' });
  //   }
  //   res.status(200).json({ message: 'File uploaded successfully', filename: req.file.filename });
  // });

  //azure blob api
  app.post('/api/upload', verifyToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const blobName = `${req.user.name.replace(/\s+/g, '_')}_${Date.now()}${path.extname(req.file.originalname)}`;
    const fileUrl = await uploadToBlobStorage(req.file.buffer, blobName, req.file.mimetype);

    res.status(200).json({ message: 'Upload successful', fileUrl });
  } catch (err) {
    console.error("Azure Blob upload error:", err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});
  



  app.post('/api/bot-reply', (req, res) => {
    const { message } = req.body;
    const reply = `You said: "${message}". I'm still learning to help you better!`;
    res.json({ reply });
  });

  


  return app;
};

module.exports = { createApp };
