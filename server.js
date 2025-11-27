const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { db, initializeDatabase, query, execute } = require('./config/sqlite-database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File uploads (resume PDFs)
const resumesDir = path.join(__dirname, 'uploads', 'resumes');
fs.mkdirSync(resumesDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function(req, file, cb) { cb(null, resumesDir); },
  filename: function(req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, unique + ext);
  }
});
const upload = multer({
  storage,
  fileFilter: function(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (ext !== '.pdf') return cb(new Error('Only PDF files are allowed'));
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Initialize SQLite Database
initializeDatabase().catch(console.error);

// API Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const result = await execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    res.json({ message: 'Account created successfully', userId: result.insertId });
  } catch (error) {
    if (String(error.message || '').includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Account already exists. Please login.' });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const rows = await query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = rows[0];
    res.json({ 
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Student routes
app.get('/api/students', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await query('SELECT * FROM students WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get student error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/students', upload.single('resume'), async (req, res) => {
  // Normalize and validate inputs
  const raw = req.body || {};
  const firstName = String(raw.first_name || '').trim();
  const lastName = String(raw.last_name || '').trim();
  const usn = String(raw.usn || '').trim();
  const gender = String(raw.gender || '').trim();
  const email = String(raw.email || '').trim().toLowerCase();
  const phone = String(raw.phone || '').trim();
  const department = String(raw.department || '').trim();
  const batch = String(raw.batch || '').trim();
  const skillsInput = raw.skills;
  const domain = String(raw.domain || '').trim();

  if (!firstName || !lastName || !usn || !gender || !email || !phone || !department || !batch || !skillsInput || !domain) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const skillsString = Array.isArray(skillsInput)
    ? skillsInput.map(s => String(s).trim()).filter(Boolean).join(', ')
    : String(skillsInput).trim();

  const file = req.file;
  const resumePath = file ? path.join('uploads', 'resumes', file.filename).replace(/\\/g, '/') : null;

  try {
    // Pre-check duplicates using case-insensitive email comparison
    const existing = await query(
      'SELECT id, email, usn FROM students WHERE LOWER(email) = LOWER(?) OR usn = ? LIMIT 1',
      [email, usn]
    );
    if (existing.length > 0) {
      if (existing[0].usn === usn) {
        return res.status(409).json({ error: 'Student with this USN already exists' });
      }
      return res.status(409).json({ error: 'Student with this email already exists' });
    }

    const result = await execute(
      `INSERT INTO students (first_name, last_name, usn, gender, email, phone, department, batch, skills, domain, resume_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, usn, gender, email, phone, department, batch, skillsString, domain, resumePath]
    );
    res.json({ message: 'Student registered successfully', studentId: result.insertId, resumePath });
  } catch (error) {
    const msg = String(error.message || '');
    if (msg.includes('UNIQUE constraint failed')) {
      if (msg.includes('usn')) {
        return res.status(409).json({ error: 'Student with this USN already exists' });
      } else if (msg.includes('email')) {
        return res.status(409).json({ error: 'Student with this email already exists' });
      }
      return res.status(409).json({ error: 'Student with this information already exists' });
    }
    console.error('Student registration error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, usn, gender, email, phone, department, batch, skills, domain } = req.body;
  if (!first_name || !last_name || !usn || !gender || !email || !phone || !department || !batch || !skills || !domain) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const skillsString = Array.isArray(skills) ? skills.join(', ') : skills;
  try {
    const result = await execute(
      `UPDATE students 
       SET first_name = ?, last_name = ?, usn = ?, gender = ?, email = ?, phone = ?, department = ?, batch = ?, skills = ?, domain = ?
       WHERE id = ?`,
      [first_name, last_name, usn, gender, email, phone, department, batch, skillsString, domain, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    const msg = String(error.message || '');
    if (msg.includes('UNIQUE constraint failed')) {
      if (msg.includes('usn')) {
        return res.status(409).json({ error: 'Student with this USN already exists' });
      } else if (msg.includes('email')) {
        return res.status(409).json({ error: 'Student with this email already exists' });
      }
      return res.status(409).json({ error: 'Student with this information already exists' });
    }
    console.error('Update student error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await execute('DELETE FROM students WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get students by department and batch
app.get('/api/students/department/:dept/batch/:batch', async (req, res) => {
  const { dept, batch } = req.params;
  try {
    const rows = await query(
      'SELECT * FROM students WHERE department = ? AND batch = ? ORDER BY first_name',
      [dept, batch]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get students by dept/batch error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Student search by skills or domain
app.get('/api/students/search', async (req, res) => {
  const skillsRaw = String(req.query.skills || '').toLowerCase();
  const domainRaw = String(req.query.domain || '').toLowerCase();
  const skillsTokens = skillsRaw
    .split(/[,\n\t ]+/)
    .map(s => s.trim())
    .filter(Boolean);
  const domainToken = domainRaw.trim();
  if (!skillsTokens.length && !domainToken) {
    return res.status(400).json({ error: 'Provide skills or domain to search' });
  }
  try {
    let sql = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    // Build skill OR block
    let skillsBlock = '';
    if (skillsTokens.length) {
      const ors = skillsTokens.map(() => 'LOWER(skills) LIKE ?');
      skillsBlock = '(' + ors.join(' OR ') + ')';
    }

    // Domain condition
    let domainBlock = '';
    if (domainToken) {
      domainBlock = 'LOWER(domain) LIKE ?';
    }

    // Combine blocks: if both provided, use OR between them per requirement
    if (skillsBlock && domainBlock) {
      sql += ' AND (' + skillsBlock + ' OR ' + domainBlock + ')';
      skillsTokens.forEach(t => params.push('%' + t + '%'));
      params.push('%' + domainToken + '%');
    } else if (skillsBlock) {
      sql += ' AND ' + skillsBlock;
      skillsTokens.forEach(t => params.push('%' + t + '%'));
    } else if (domainBlock) {
      sql += ' AND ' + domainBlock;
      params.push('%' + domainToken + '%');
    }

    sql += ' ORDER BY first_name';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Search students error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Companies routes
app.get('/api/companies', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get companies error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/companies', async (req, res) => {
  const { name, role, location, package: ctc, schedule_date, eligibility, notes } = req.body || {};
  const nameNorm = String(name || '').trim();
  if (!nameNorm) return res.status(400).json({ error: 'Company name is required' });
  try {
    const result = await execute(
      `INSERT INTO companies (name, role, location, package, schedule_date, eligibility, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nameNorm, role || null, location || null, ctc || null, schedule_date || null, eligibility || null, notes || null]
    );
    res.json({ message: 'Company saved', companyId: result.insertId });
  } catch (error) {
    console.error('Create company error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Placement Portal API is running' });
});

// Email feature removed

// Serve the main HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/student-registration', (req, res) => {
  res.sendFile(path.join(__dirname, 'student-registration.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Placement Portal API running on http://localhost:${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`👨‍🎓 Student Registration: http://localhost:${PORT}/student-registration`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    db.close();
    console.log('✅ SQLite Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
  process.exit(0);
});
