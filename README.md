# SGBIT Placement Portal - Backend Integration

This project now includes a backend API to store student details in a database instead of using localStorage.

## Features

- **Backend API**: Node.js with Express server
- **Database**: SQLite for easy setup and development
- **Authentication**: User registration and login system
- **Student Management**: CRUD operations for student data
- **Frontend Integration**: Updated HTML pages to use backend API

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3000`

### 3. Access the Application

- **Main Portal**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **API Health Check**: http://localhost:3000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/department/:dept/batch/:batch` - Get students by department and batch

## Database Schema

### Users Table
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `email` (TEXT UNIQUE)
- `password` (TEXT)
- `is_admin` (BOOLEAN)
- `created_at` (DATETIME)

### Students Table
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `email` (TEXT UNIQUE)
- `department` (TEXT)
- `batch` (TEXT)
- `skills` (TEXT)
- `domain` (TEXT)
- `created_at` (DATETIME)

## Default Admin Credentials

- **Email**: srkadalagi@gmail.com
- **Password**: srushti2003154

## File Structure

```
project/
├── server.js              # Main backend server
├── package.json           # Node.js dependencies
├── placement_portal.db    # SQLite database (created automatically)
├── index.html             # Main portal page
├── admin.html             # Admin dashboard
├── styles.css             # Styling
└── README.md              # This file
```

## Development Notes

- The database file (`placement_portal.db`) is created automatically on first run
- All student data is now stored persistently in the database
- The frontend has been updated to use API calls instead of localStorage
- CORS is enabled for cross-origin requests
- The server serves static files from the current directory

## Troubleshooting

1. **Port already in use**: Change the PORT in server.js or kill the process using port 3000
2. **Database errors**: Delete `placement_portal.db` and restart the server
3. **CORS issues**: Ensure the frontend is served from the same origin or update CORS settings

## Next Steps

- Add password hashing for security
- Implement JWT tokens for authentication
- Add input validation and sanitization
- Set up environment variables for configuration
- Add database migrations
- Implement proper error handling and logging
