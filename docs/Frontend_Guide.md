# Frontend Guide

This guide provides an overview of the frontend architecture, file structure, and development practices for the Task Referral Platform.

## Tech Stack

- **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API Communication:** `fetch` API
- **Design:** Responsive design with Dark/Light mode support.

## Project Structure

```
frontend/
├── index.html      # Landing page
├── login.html      # Login page
├── register.html   # Registration page
├── dashboard/      # User dashboard section
│   ├── index.html
│   └── ...
├── admin/          # Admin panel section
│   ├── index.html
│   └── ...
├── assets/         # Global assets
│   ├── css/
│   │   ├── main.css
│   │   └── ...
│   ├── js/
│   │   ├── api.js         # Central API fetch wrapper
│   │   ├── auth.js        # Authentication logic
│   │   ├── main.js        # Global scripts, theme toggling
│   │   └── ...
│   └── images/
└── components/     # Reusable HTML snippets (header, footer, etc.)
```

## Core Concepts

### 1. API Interaction (`assets/js/api.js`)

- All communication with the backend API is handled through a central fetch wrapper in `api.js`.
- This wrapper is responsible for:
  - Setting the base URL for API requests.
  - Automatically attaching the JWT `Authorization` header to requests.
  - Handling token storage in `localStorage`.
  - Centralizing error handling for API responses.
  - Managing token refresh logic.

**Example Usage:**
```javascript
// In assets/js/tasks.js
import { api } from './api.js';

async function fetchTasks() {
  try {
    const tasks = await api.get('/tasks');
    // Render tasks...
  } catch (error) {
    // Display error to user...
  }
}
```

### 2. Authentication (`assets/js/auth.js`)

- This file manages the user's authentication state.
- It handles login, registration, and logout flows.
- It provides functions to check if a user is logged in (`isLoggedIn()`).
- It implements protected routes by redirecting users to `login.html` if they are not authenticated and try to access a protected page like the dashboard.

### 3. State Management

- Since this is a Vanilla JS application, state is managed locally within each page's script.
- The user's authentication token and basic user info are stored in `localStorage` to persist across sessions.
- Avoid storing sensitive information in `localStorage`.

### 4. Styling and Theming

- Global styles are located in `assets/css/main.css`.
- A `data-theme="dark"` attribute is toggled on the `<body>` tag to switch between light and dark modes.
- CSS variables are used extensively for easy theming and consistency.
