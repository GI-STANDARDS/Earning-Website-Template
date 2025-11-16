# Backend Guide

This guide provides an overview of the backend architecture, conventions, and key components of the Task Referral Platform.

## Tech Stack

- **Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** bcryptjs, express-rate-limit, express-validator, cors, helmet
- **Email:** Nodemailer

## Project Structure

The backend follows a feature-oriented structure:

```
backend/
├── config/         # Environment configuration (database, server)
├── controllers/    # Contains business logic for each route
├── models/         # Mongoose schemas and models
├── routes/         # API route definitions
├── middlewares/    # Custom middleware (auth, error handling, validation)
├── utils/          # Reusable helper functions (token generation, calculations)
├── cron/           # Scheduled jobs (e.g., subscription checks)
├── tests/          # Jest integration and unit tests
├── logs/           # Application log files
├── app.js          # Express app configuration and middleware setup
└── server.js       # Main entry point, starts the server
```

## Core Concepts

### 1. Request Lifecycle

1.  A request hits `server.js` and is passed to `app.js`.
2.  `app.js` applies global middleware (CORS, rate limiting, body-parser, helmet).
3.  The request is directed to the appropriate router in the `routes/` directory.
4.  Route-specific middleware (e.g., `authMiddleware`, `adminMiddleware`) is executed.
5.  The request is handled by a `controller` function, which contains the core business logic.
6.  The controller interacts with `models` to perform database operations.
7.  Utility functions from `utils/` are used for common tasks like calculations or token generation.
8.  The controller sends a JSON response back to the client.
9.  If an error occurs, it is caught and passed to the central error handling middleware.

### 2. Authentication (`authMiddleware.js`)

- The `authMiddleware` protects private routes.
- It checks for a valid JWT in the `Authorization: Bearer <token>` header.
- If the token is valid, it decodes the payload (containing `userId` and `role`) and attaches the user object to the `req` object for use in subsequent controllers.
- If the token is missing or invalid, it returns a `401 Unauthorized` error.

### 3. Configuration (`config/`)

- All environment-dependent variables are managed through a `.env` file.
- The `config/serverConfig.js` file loads and exports these variables for use throughout the application.
- **Never commit the `.env` file to version control.** Use `.env.example` as a template.

### 4. Error Handling

- Asynchronous errors in controllers should be wrapped in `try...catch` blocks or use an async error handling wrapper.
- Errors are passed to a central error handling middleware (`errorMiddleware.js`) using `next(error)`.
- This middleware formats the error into a consistent JSON response and sets the appropriate HTTP status code. This prevents stack traces from leaking to the client in production.

### 5. Utilities (`utils/`)

This directory contains pure functions that can be reused across the application.

- `generateToken.js`: Handles JWT creation and verification.
- `passwordUtils.js`: Manages password hashing and comparison.
- `referralCodeGenerator.js`: Creates unique referral codes.
- `calculateEarnings.js`: Contains business logic for calculating rewards, fees, and bonuses.
- `constants.js`: Stores application-wide constants like roles, statuses, and error messages.

## Running Locally

1.  Ensure MongoDB is running.
2.  Create a `.env` file from `.env.example` and fill in the required values.
3.  Install dependencies: `npm install`
4.  Start the development server: `npm run dev`

The server will be available at `http://localhost:5000` (or the port specified in your `.env`).
