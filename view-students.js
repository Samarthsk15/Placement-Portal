#!/usr/bin/env node

/**
 * View Students Script
 * This script displays all registered students from MySQL database
 */

const { pool } = require('./config/database');

async function viewStudents() {
  console.log('📊 Fetching student details from MySQL database...\n');
  
  try {
    // Get all students
    const [students] = await pool.execute(
      'SELECT * FROM students ORDER BY created_at DESC'
    );
    
    if (students.length === 0) {
      console.log('❌ No students found in the database.');
      console.log('💡 Register some students first through the portal.');
      return;
    }
    
    console.log(`✅ Found ${students.length} registered students:\n`);
    console.log('=' .repeat(80));
    
    students.forEach((student, index) => {
      console.log(`\n📋 Student #${index + 1}:`);
      console.log(`   ID: ${student.id}`);
      console.log(`   Name: ${student.first_name} ${student.last_name}`);
      console.log(`   USN: ${student.usn}`);
      console.log(`   Gender: ${student.gender}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Phone: ${student.phone}`);
      console.log(`   Department: ${student.department}`);
      console.log(`   Batch: ${student.batch}`);
      console.log(`   Domain: ${student.domain}`);
      console.log(`   Skills: ${student.skills}`);
      console.log(`   Resume: ${student.resume_path || 'Not uploaded'}`);
      console.log(`   Registered: ${new Date(student.created_at).toLocaleString()}`);
      console.log('-'.repeat(50));
    });
    
    // Summary by department
    console.log('\n📊 Summary by Department:');
    const deptSummary = {};
    students.forEach(student => {
      deptSummary[student.department] = (deptSummary[student.department] || 0) + 1;
    });
    
    Object.entries(deptSummary).forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} students`);
    });
    
    // Summary by batch
    console.log('\n📊 Summary by Batch:');
    const batchSummary = {};
    students.forEach(student => {
      batchSummary[student.batch] = (batchSummary[student.batch] || 0) + 1;
    });
    
    Object.entries(batchSummary).forEach(([batch, count]) => {
      console.log(`   ${batch}: ${count} students`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching students:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check database connection');
    console.log('3. Run: npm run setup-mysql');
  }
}

// Run the script
viewStudents().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
