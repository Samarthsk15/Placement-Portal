const { db, query, execute } = require('./config/sqlite-database');

async function addSampleStudents() {
  console.log('🔄 Adding sample students to the database...\n');
  
  const sampleStudents = [
    // CSE Students
    ['John', 'Doe', '1SG20CS001', 'Male', 'john.doe@example.com', '+91 9876543210', 'CSE', '2020', 'Java, Python, SQL, React', 'Web Development', null],
    ['Jane', 'Smith', '1SG20CS002', 'Female', 'jane.smith@example.com', '+91 9876543211', 'CSE', '2020', 'JavaScript, Node.js, MongoDB', 'Full Stack Development', null],
    ['Michael', 'Johnson', '1SG20CS003', 'Male', 'michael.johnson@example.com', '+91 9876543212', 'CSE', '2020', 'Python, Machine Learning, TensorFlow', 'Data Science', null],
    ['Sarah', 'Williams', '1SG20CS004', 'Female', 'sarah.williams@example.com', '+91 9876543213', 'CSE', '2020', 'C++, Algorithms, Data Structures', 'Software Engineering', null],
    ['David', 'Brown', '1SG20CS005', 'Male', 'david.brown@example.com', '+91 9876543214', 'CSE', '2020', 'Android, Kotlin, Firebase', 'Mobile App Development', null],
    
    // ECE Students
    ['Alex', 'Martinez', '1SG20ECE001', 'Male', 'alex.martinez@example.com', '+91 9876543220', 'ECE', '2020', 'C, C++, Embedded Systems', 'Embedded Systems', null],
    ['Sophia', 'Rodriguez', '1SG20ECE002', 'Female', 'sophia.rodriguez@example.com', '+91 9876543221', 'ECE', '2020', 'VLSI, Verilog, FPGA', 'VLSI Design', null],
    ['William', 'Lee', '1SG20ECE003', 'Male', 'william.lee@example.com', '+91 9876543222', 'ECE', '2020', 'Signal Processing, MATLAB', 'Signal Processing', null],
    
    // EEE Students
    ['Noah', 'Young', '1SG20EEE001', 'Male', 'noah.young@example.com', '+91 9876543230', 'EEE', '2020', 'Power Systems, Electrical Machines', 'Power Systems', null],
    ['Amelia', 'King', '1SG20EEE002', 'Female', 'amelia.king@example.com', '+91 9876543231', 'EEE', '2020', 'Renewable Energy, Solar Power', 'Renewable Energy', null],
    
    // MECH Students
    ['Evelyn', 'Scott', '1SG20MECH001', 'Female', 'evelyn.scott@example.com', '+91 9876543235', 'MECH', '2020', 'CAD, SolidWorks, ANSYS', 'Design Engineering', null],
    ['Logan', 'Green', '1SG20MECH002', 'Male', 'logan.green@example.com', '+91 9876543236', 'MECH', '2020', 'Manufacturing, CNC', 'Manufacturing Engineering', null],
    
    // CIVIL Students
    ['Jackson', 'Nelson', '1SG20CIVIL001', 'Male', 'jackson.nelson@example.com', '+91 9876543240', 'CIVIL', '2020', 'Structural Analysis, Concrete Design', 'Structural Engineering', null],
    ['Sofia', 'Carter', '1SG20CIVIL002', 'Female', 'sofia.carter@example.com', '+91 9876543241', 'CIVIL', '2020', 'Environmental Engineering, Water Treatment', 'Environmental Engineering', null]
  ];

  try {
    // Clear existing students first
    await execute('DELETE FROM students');
    console.log('✅ Cleared existing students');
    
    // Insert sample students
    for (const student of sampleStudents) {
      await execute(
        `INSERT INTO students (first_name, last_name, usn, gender, email, phone, department, batch, skills, domain, resume_path) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        student
      );
    }
    
    console.log(`✅ Added ${sampleStudents.length} sample students`);
    
    // Show summary
    const students = await query('SELECT department, COUNT(*) as count FROM students GROUP BY department');
    console.log('\n📊 Students by Department:');
    students.forEach(row => {
      console.log(`   ${row.department}: ${row.count} students`);
    });
    
    const totalStudents = await query('SELECT COUNT(*) as total FROM students');
    console.log(`\n🎉 Total students in database: ${totalStudents[0].total}`);
    
  } catch (error) {
    console.error('❌ Error adding sample students:', error.message);
  } finally {
    db.close();
  }
}

addSampleStudents();
