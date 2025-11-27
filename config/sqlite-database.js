const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite Database Configuration
const dbPath = path.join(__dirname, '..', 'placement_portal.db');
const db = new sqlite3.Database(dbPath);

// Test database connection
function testConnection() {
  return new Promise((resolve, reject) => {
    db.get("SELECT 1", (err) => {
      if (err) {
        console.error('❌ SQLite Database connection failed:', err.message);
        reject(err);
      } else {
        console.log('✅ SQLite Database connected successfully');
        resolve(true);
      }
    });
  });
}

// Create tables
function createTables() {
  return new Promise((resolve, reject) => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err.message);
        reject(err);
        return;
      }
    });

    // Create students table
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        usn TEXT UNIQUE NOT NULL,
        gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')) NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        department TEXT NOT NULL,
        batch TEXT NOT NULL,
        skills TEXT NOT NULL,
        domain TEXT NOT NULL,
        resume_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating students table:', err.message);
        reject(err);
        return;
      }
    });

    // Create companies table
    db.run(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT,
        location TEXT,
        package TEXT,
        schedule_date TEXT,
        eligibility TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating companies table:', err.message);
        reject(err);
        return;
      }
    });

    // Insert default admin user
    db.run(`
      INSERT OR IGNORE INTO users (name, email, password, is_admin) 
      VALUES ('Admin', 'srkadalagi@gmail.com', 'srushti2003154', 1)
    `, (err) => {
      if (err) {
        console.error('❌ Error inserting admin user:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Database tables created successfully');
      resolve(true);
    });
  });
}

// Initialize database
async function initializeDatabase() {
  console.log('🔄 Initializing SQLite Database...');
  
  try {
    await testConnection();
    await createTables();
    console.log('✅ SQLite Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

// Database query helper
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Database execute helper
function execute(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ insertId: this.lastID, affectedRows: this.changes });
      }
    });
  });
}

module.exports = {
  db,
  testConnection,
  createTables,
  initializeDatabase,
  query,
  execute
};
