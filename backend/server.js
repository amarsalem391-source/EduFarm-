const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB_FILE = path.join(__dirname, 'edufarm.db');
const db = new Database(DB_FILE);

// Serve frontend static files (project root) so pages are available at http://localhost:3000/index.html
app.use(express.static(path.join(__dirname, '..')));

// Initialize users table
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  userType TEXT DEFAULT 'student'
)`).run();

// Initialize earnings table
db.prepare(`CREATE TABLE IF NOT EXISTS earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_email TEXT NOT NULL,
  amount REAL DEFAULT 0,
  date TEXT DEFAULT CURRENT_TIMESTAMP,
  details TEXT
)`).run();

// Initialize withdrawals table
db.prepare(`CREATE TABLE IF NOT EXISTS withdrawals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_email TEXT NOT NULL,
  amount REAL NOT NULL,
  request_date TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending'
)`).run();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Register
app.post('/api/register', (req, res) => {
  const { fullname, email, phone, password, userType } = req.body || {};
  if (!fullname || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (name,email,phone,password,userType) VALUES (?,?,?,?,?)');
    const info = stmt.run(fullname, email, phone || '', hash, userType || 'student');
    // create token
    const token = jwt.sign({ email, name: fullname, userType: userType || 'student' }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ success: true, user: { name: fullname, email, userType: userType || 'student' }, token });
  } catch (err) {
    if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ success: false, message: 'User exists' });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const stmt = db.prepare('SELECT id,name,email,password,userType FROM users WHERE email = ? LIMIT 1');
    const user = stmt.get(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ email: user.email, name: user.name, userType: user.userType }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ success: true, user: { name: user.name, email: user.email, userType: user.userType }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user by email
// Protected endpoint to return current user from token
function authenticateToken(req, res, next){
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ success:false, message:'No token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ success:false, message:'Invalid auth' });
  const token = parts[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){
    return res.status(401).json({ success:false, message:'Invalid token' });
  }
}

app.get('/api/me', authenticateToken, (req,res)=>{
  const u = req.user || {};
  res.json({ success:true, user: { name: u.name, email: u.email, userType: u.userType } });
});

// --- Earnings & Withdrawals API ---

// Get all earnings (Admin) or specific teacher
app.get('/api/earnings', authenticateToken, (req, res) => {
    try {
        let stmt;
        if (req.user.userType === 'admin') {
            stmt = db.prepare('SELECT * FROM earnings ORDER BY date DESC');
        } else {
             stmt = db.prepare('SELECT * FROM earnings WHERE teacher_email = ? ORDER BY date DESC');
        }
        const rows = req.user.userType === 'admin' ? stmt.all() : stmt.all(req.user.email);
        res.json({ success: true, data: rows });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
});

// Get withdrawals
app.get('/api/withdrawals', authenticateToken, (req, res) => {
    try {
        let stmt;
        if (req.user.userType === 'admin') {
            stmt = db.prepare('SELECT * FROM withdrawals ORDER BY request_date DESC');
        } else {
             stmt = db.prepare('SELECT * FROM withdrawals WHERE teacher_email = ? ORDER BY request_date DESC');
        }
        const rows = req.user.userType === 'admin' ? stmt.all() : stmt.all(req.user.email);
        res.json({ success: true, data: rows });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
});

// Request withdrawal
app.post('/api/withdrawals', authenticateToken, (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });
    try {
        // Here you might want to check if they have enough balance
        const stmt = db.prepare('INSERT INTO withdrawals (teacher_email, amount) VALUES (?, ?)');
        stmt.run(req.user.email, amount);
        res.json({ success: true, message: 'Request submitted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
});

// Approve withdrawal (Admin)
app.post('/api/withdrawals/:id/approve', authenticateToken, (req, res) => {
    if (req.user.userType !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });
    try {
        const stmt = db.prepare('UPDATE withdrawals SET status = "approved" WHERE id = ?');
        stmt.run(req.params.id);
        res.json({ success: true, message: 'Approved' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
});


// Serve PDFs statically from ../pdfs (if exist)
app.use('/pdfs', express.static(path.join(__dirname, '..', 'pdfs')));

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('EduFarm backend (sqlite) listening on', PORT));
