require('dotenv').config();
const mysql = require('mysql2/promise');

// MySQL Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Empty password for now
  database: process.env.DB_NAME || 'project', // Use your existing 'project' schema
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Database connection failed:', error.message);
    return false;
  }
}

// Create database if it doesn't exist
async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' created/verified`);
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    return false;
  }
}

// Create tables
async function createTables() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create students table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        usn VARCHAR(20) UNIQUE NOT NULL,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        department VARCHAR(50) NOT NULL,
        batch VARCHAR(10) NOT NULL,
        skills TEXT NOT NULL,
        domain VARCHAR(255) NOT NULL,
        resume_path VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default admin user
    await connection.execute(`
      INSERT IGNORE INTO users (name, email, password, is_admin) 
      VALUES ('Admin', 'srkadalagi@gmail.com', 'srushti2003154', TRUE)
    `);
    
    console.log('✅ Database tables created successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    return false;
  }
}

// Initialize database
async function initializeDatabase() {
  console.log('🔄 Initializing MySQL Database...');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    throw new Error('Failed to connect to MySQL database');
  }
  
  console.log('✅ MySQL Database initialization completed');
}

module.exports = {
  pool,
  testConnection,
  createDatabase,
  createTables,
  initializeDatabase
};
