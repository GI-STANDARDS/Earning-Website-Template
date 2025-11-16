# Task Referral Platform

A comprehensive full-stack application for task management, user referrals, subscription plans, and admin controls.

I’d like to thank **GitHub Copilot** for its assistance in **understanding** and **resolving** errors, as well as helping in **building the project**.

## Features

✅ User authentication with JWT  
✅ Unique referral codes & tracking  
✅ Task completion system  
✅ Subscription plans & payments  
✅ Admin dashboard & controls  
✅ Security: password hashing, rate limiting, validation  
✅ Responsive frontend with dark/light mode  
✅ Activity logging & analytics  

## Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB (Mongoose ODM)
- JWT Authentication
- bcryptjs for password hashing
- express-rate-limit for security

**Frontend:**
- HTML5 / CSS3
- Vanilla JavaScript
- Responsive design
- Dark/Light mode support

## Project Structure

```
ProjectRootDirectory/
├── backend/
│   ├── config/         # Database, server, security config
│   ├── routes/         # API endpoints
│   ├── controllers/    # Business logic (coming soon)
│   ├── models/         # Database schemas (coming soon)
│   ├── middlewares/    # Auth, validation, error handling
│   ├── utils/          # Helpers (token, password, validation)
│   ├── cron/           # Scheduled tasks (coming soon)
│   ├── tests/          # Unit tests (coming soon)
│   └── server.js       # Express app entry
├── frontend/
│   ├── index.html      # Landing page
│   ├── login.html      # Login page
│   ├── register.html   # Registration page
│   ├── dashboard/      # User dashboard
│   ├── admin/          # Admin panel
│   ├── assets/         # CSS, JS, Images
│   └── components/     # Reusable HTML components
└── docs/               # API documentation
```

## Installation

### Prerequisites
- Node.js v14+ and npm
- MongoDB installed and running locally
- Git

### Setup Instructions

1. **Clone or navigate to project:**
   ```bash
   cd C:\path\to\ProjectRootDirectory

   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env with your values:**
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:PORT/Your-Custom-Project-Name
   JWT_SECRET=your-secret-key-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Make sure MongoDB is running:**
   ```bash
   mongod
   ```

6. **Start backend server:**
   ```bash
   npm run dev
   ```

   Server will run on: `http://localhost:5000`

7. **Test the API:**
   - Health check: `http://localhost:5000/api/health`
   - Status: `http://localhost:5000/api/status`
   - Ping: `http://localhost:5000/api/misc/ping`


## Helping Request
- Provides support in building the project.

- Assists in identifying and resolving issues.

- Anyone receiving a helper or contributor tag is permitted to use the project with proper credit.

- Helps me protect the project by reporting unauthorized reselling or misuse.
- <span style="color:red">This project is not for sale</span>
- Its code may not be used commercially or redistributed as your own.



