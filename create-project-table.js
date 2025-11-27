#!/usr/bin/env node

/**
 * Create Students Table in 'project' Schema
 * This script creates the students table with all registration form fields
 */

const mysql = require('mysql2/promise');

// Database configuration for 'project' schema
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'project', // Using 'project' schema
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

async function createProjectStudentsTable() {
  console.log('🔄 Creating students table in "project" schema...\n');
  
  let pool;
  
  try {
    // Create connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
    
    // Create students table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL COMMENT 'Student first name',
        last_name VARCHAR(100) NOT NULL COMMENT 'Student last name',
        usn VARCHAR(20) UNIQUE NOT NULL COMMENT 'University Seat Number',
        gender ENUM('Male', 'Female', 'Other') NOT NULL COMMENT 'Student gender',
        email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Student email address',
        phone VARCHAR(20) NOT NULL COMMENT 'Student phone number',
        department VARCHAR(50) NOT NULL COMMENT 'Department (CSE, ECE, EEE, MECH, CIVIL)',
        batch VARCHAR(10) NOT NULL COMMENT 'Batch year (2018-2025)',
        skills TEXT NOT NULL COMMENT 'Comma-separated skills list',
        domain VARCHAR(255) NOT NULL COMMENT 'Area of specialization',
        resume_path VARCHAR(500) NULL COMMENT 'Path to uploaded resume PDF',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Registration timestamp',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
      )
    `);
    console.log('✅ Students table created successfully in project schema');
    
    // Create indexes for better performance
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_students_department ON students(department)');
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch)');
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_students_department_batch ON students(department, batch)');
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at)');
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_students_email ON students(email)');
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_students_usn ON students(usn)');
    console.log('✅ Indexes created for better performance');
    
    // Show table structure
    const [columns] = await pool.execute('DESCRIBE students');
    console.log('\n📋 Table Structure:');
    console.log('=' .repeat(80));
    console.log('Field'.padEnd(15) + ' | ' + 'Type'.padEnd(20) + ' | ' + 'Null'.padEnd(5) + ' | ' + 'Key'.padEnd(5) + ' | ' + 'Default');
    console.log('-'.repeat(80));
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(15)} | ${col.Type.padEnd(20)} | ${col.Null.padEnd(5)} | ${col.Key.padEnd(5)} | ${col.Default || 'NULL'}`);
    });
    
    // Check if table has any data
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM students');
    console.log(`\n📊 Current records in table: ${rows[0].count}`);
    
    console.log('\n🎉 Students table is ready for use in project schema!');
    console.log('\n📝 Table includes all fields for student registration:');
    console.log('   • Personal Info: First Name, Last Name, Gender');
    console.log('   • Academic Info: USN, Department, Batch');
    console.log('   • Contact Info: Email, Phone');
    console.log('   • Professional Info: Skills, Domain, Resume Path');
    console.log('   • System Info: Created/Updated timestamps');
    
  } catch (error) {
    console.error('\n❌ Error creating table:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check database connection');
    console.log('3. Ensure "project" database exists');
    console.log('4. Ensure you have CREATE TABLE privileges');
    console.log('5. Run: CREATE DATABASE IF NOT EXISTS project;');
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the script
createProjectStudentsTable().then(() => {
  console.log('\n✅ Script completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
