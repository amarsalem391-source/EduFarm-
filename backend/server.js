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

// Serve PDFs statically from ../pdfs (if exist)
app.use('/pdfs', express.static(path.join(__dirname, '..', 'pdfs')));

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('EduFarm backend (sqlite) listening on', PORT));
