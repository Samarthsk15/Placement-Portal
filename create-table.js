#!/usr/bin/env node

/**
 * Create Students Table Script
 * This script creates the students table with all registration form fields
 */

const { pool } = require('./config/database');

async function createStudentsTable() {
  console.log('🔄 Creating students table with all registration form fields...\n');
  
  try {
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
    console.log('✅ Students table created successfully');
    
    // Create indexes for better performance
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_students_department ON students(department)');
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch)');
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_students_department_batch ON students(department, batch)');
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at)');
    console.log('✅ Indexes created for better performance');
    
    // Show table structure
    const [columns] = await pool.execute('DESCRIBE students');
    console.log('\n📋 Table Structure:');
    console.log('=' .repeat(80));
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(15)} | ${col.Type.padEnd(20)} | ${col.Null} | ${col.Key} | ${col.Default || 'NULL'}`);
    });
    
    // Check if table has any data
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM students');
    console.log(`\n📊 Current records in table: ${rows[0].count}`);
    
    console.log('\n🎉 Students table is ready for use!');
    console.log('\n📝 Table includes all fields from registration form:');
    console.log('   • First Name, Last Name');
    console.log('   • USN (University Seat Number)');
    console.log('   • Gender (Male/Female/Other)');
    console.log('   • Email, Phone Number');
    console.log('   • Department, Batch');
    console.log('   • Skills, Domain');
    console.log('   • Resume Path (optional)');
    console.log('   • Created/Updated timestamps');
    
  } catch (error) {
    console.error('\n❌ Error creating table:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check database connection');
    console.log('3. Ensure you have CREATE TABLE privileges');
    process.exit(1);
  }
}

// Run the script
createStudentsTable().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});












