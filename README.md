# Task Referral Platform

A comprehensive full-stack application for task management, user referrals, subscription plans, and admin controls.

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
project-root/
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
   cd C:\Users\window\Desktop\VS-AI\Projects\Python\Web\project-root
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
   MONGODB_URI=mongodb://localhost:27017/task-referral-platform
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

## API Endpoints (Phase 1 - Scaffolding)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh JWT

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/balance` - Get user balance
- `GET /api/users/activity` - Activity log

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks/complete` - Complete a task
- `GET /api/tasks/user/completed` - User's completed tasks

### Referrals
- `GET /api/referrals/my-code` - Get referral code
- `GET /api/referrals/referrals` - Get referrals
- `GET /api/referrals/earnings` - Get earnings
- `POST /api/referrals/register-with-code` - Register with code

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/tasks/create` - Create task
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/logs` - Get logs

### Payments
- `POST /api/payments/initialize` - Start payment
- `POST /api/payments/webhook` - Payment webhook
- `GET /api/payments/history` - Payment history
- `POST /api/payments/manual` - Manual payment

## Using ngrok for Local Testing

To expose your local server publicly:

1. **Download ngrok:** https://ngrok.com/download

2. **Run ngrok:**
   ```bash
   ngrok http 5000
   ```

3. **Share the public URL:**
   ```
   https://your-ngrok-url.ngrok.io
   ```

4. **Update frontend to use ngrok URL:**
   - Change API base URL in your JS files to the ngrok URL

## Development Workflow

### Phase 1 ✅ - Backend Foundation (Complete)
- Express server setup
- Middleware configuration
- Route scaffolding
- Utility functions
- Security setup

### Phase 2 ✅ - Authentication System (Complete)
- User model & schema
- Register/Login endpoints
- JWT implementation
- Email verification

### Phase 3 ✅ - Referral System (Complete)
- Referral model & controller
- Code generation & tracking
- Earnings calculation & claiming
- Referral statistics

### Phase 4 ✅ - Tasks & Plans (Complete)
- Task model & full CRUD controller
- Plan model & subscription controller
- Payment model & full payment controller
- Task completion with rewards
- Subscription management
- Payment initialization & webhooks

### Phase 5 ✅ - Admin Panel (Complete)
- Admin controller with user management
- System controller with health checks & diagnostics
- Admin routes for analytics & controls
- Activity logging & log management
- Growth metrics & performance analytics
- Dashboard summary endpoints

### Phase 6 ✅ - Frontend (Complete)
- HTML pages (login, register, landing, dashboard, admin)
- JavaScript API integration with fetch wrapper
- Comprehensive CSS styling (main, forms, components, dashboard, admin)
- Dark/Light mode support
- Dashboard implementation with stats and data loading
- Admin panel UI with analytics
- Authentication flow and protected routes
- Responsive design for all screen sizes
- Toast notifications and loading indicators

### Phase 7 ✅ - Testing & Deployment (Complete)
- Jest test setup and configuration
- Utility function tests (password hashing, token generation, referral codes)
- Authentication integration tests (register, login, email verification)
- Task endpoint tests (CRUD, completion, permissions)
- System & admin endpoint tests (health, analytics, user management)
- User endpoint tests (profile, balance, activity, password change)
- Docker configuration (Dockerfile, docker-compose.yml)
- Nginx reverse proxy configuration
- Comprehensive deployment guide (AWS EC2, Heroku, DigitalOcean)
- Production checklist
- Environment configuration template (.env.example)
- GitHub Actions CI/CD pipeline
- Jest configuration with coverage thresholds
- Comprehensive test utilities and mock data generators

## Environment Variables

See `.env.example` for all required variables:

```
# Core Configuration
NODE_ENV                    # development, production, test
PORT                        # Server port (default: 5000)
LOG_LEVEL                   # Logging level

# Database
MONGODB_URI                 # MongoDB connection string
MONGODB_USER               # Database username
MONGODB_PASSWORD           # Database password

# Cache
REDIS_URL                  # Redis connection URL (optional)
REDIS_PASSWORD            # Redis password

# Authentication
JWT_SECRET                 # Secret key for JWT signing
JWT_EXPIRY                # Token expiration (default: 7d)

# Email
SMTP_HOST                 # SMTP server host
SMTP_PORT                 # SMTP server port
SMTP_USER                 # Email username
SMTP_PASSWORD            # Email password
FROM_EMAIL               # Sender email address

# Payments
STRIPE_SECRET_KEY        # Stripe API secret key
STRIPE_PUBLISHABLE_KEY   # Stripe publishable key
STRIPE_WEBHOOK_SECRET    # Stripe webhook secret

# Application URLs
FRONTEND_URL             # Frontend URL
API_URL                  # Backend API URL

# Security
HELMET_ENABLED          # Enable security headers
CORS_ORIGIN             # CORS allowed origin
RATE_LIMIT_MAX_REQUESTS # Max requests per window
RATE_LIMIT_WINDOW       # Rate limit window in minutes
```

## Security Features

✅ Password hashing with bcryptjs  
✅ JWT token authentication  
✅ Rate limiting on all endpoints  
✅ Input validation with express-validator  
✅ Protected admin routes  
✅ CORS configuration  
✅ Helmet.js security headers  
✅ Error handling middleware  
✅ Request logging  
✅ HTTPS/SSL support  
✅ CSRF protection  
✅ SQL injection prevention  

## Testing

Run all tests:
```bash
npm test
```

Run specific test suites:
```bash
npm run test:utils       # Utility functions
npm run test:auth        # Authentication
npm run test:tasks       # Tasks
npm run test:system      # System & Admin
npm run test:user        # User endpoints
npm run test:watch       # Watch mode
```

## Docker Deployment

Build and run with Docker:

```bash
# Build image
npm run docker:build

# Start containers
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down
```

Services will be available at:
- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

## Deployment

### Quick Start (Docker)
```bash
docker-compose up -d
```

### Production (AWS EC2)
See `docs/Deployment_Guide.md` for:
- Complete setup instructions
- SSL/HTTPS configuration
- Database backup & recovery
- Monitoring & logging
- Troubleshooting guide

### Deployment Checklist
Review `PRODUCTION_CHECKLIST.md` before going live:
- Security verification
- Database configuration
- Environment setup
- Monitoring & alerting
- Backup strategy
- Testing requirements

## Project Structure

```
project-root/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth, validation, error handling
│   ├── utils/            # Helper functions
│   ├── cron/             # Scheduled tasks
│   ├── tests/            # Test suites
│   │   ├── setup.js      # Jest configuration
│   │   ├── testUtils.js  # Test helpers
│   │   ├── utils.test.js # Utility tests
│   │   ├── auth.test.js  # Auth tests
│   │   ├── task.test.js  # Task tests
│   │   ├── system.test.js# System tests
│   │   └── user.test.js  # User tests
│   ├── logs/             # Application logs
│   ├── app.js            # Express app
│   └── server.js         # Entry point
├── frontend/
│   ├── index.html        # Landing page
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── dashboard/        # User dashboard
│   ├── admin/            # Admin panel
│   ├── assets/           # CSS, JS, images
│   └── components/       # Reusable components
├── docs/                 # Documentation
├── .github/workflows/    # CI/CD pipelines
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker compose config
├── nginx.conf            # Nginx configuration
├── jest.config.js        # Jest configuration
├── .env.example          # Environment template
└── PRODUCTION_CHECKLIST.md # Deployment checklist
```

## Troubleshooting

**MongoDB connection error:**
- Make sure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- Verify connection string format

**Tests failing:**
- Ensure MongoDB is running in test mode
- Check NODE_ENV is set to 'test'
- Run `npm test -- --detectOpenHandles`

**Port already in use:**
- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill`

**Docker issues:**
- Rebuild image: `docker-compose build --no-cache`
- Check logs: `docker-compose logs backend`
- Ensure Docker daemon is running

**Email not sending:**
- Verify SMTP credentials
- Check firewall for SMTP port
- Enable "Less secure app access" (Gmail)

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review `docs/Deployment_Guide.md`
3. Check test logs for errors
4. Review application logs in `backend/logs/`

## License

MIT License - feel free to use this project for personal or commercial use.

---

**Status:** Phase 1-7 Complete ✅ Production Ready  
**Latest Update:** Comprehensive testing framework and deployment infrastructure  
**Next Steps:** Deploy to production following the deployment guide

