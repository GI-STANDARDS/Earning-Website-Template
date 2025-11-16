# Admin Instructions

This guide is for users with the 'admin' role, explaining how to manage the platform through the admin panel.

## Accessing the Admin Panel

1.  Log in with an account that has administrative privileges.
2.  Navigate to the `/admin` URL (e.g., `http://yourdomain.com/admin`).

## Key Features

### 1. Dashboard & Analytics

- **Endpoint:** `GET /api/admin/analytics`
- The main admin dashboard provides a high-level overview of the platform's health and growth.
- **Key Metrics:**
  - Total Users
  - New Users (last 24h/7d/30d)
  - Total Tasks Completed
  - Total Earnings Paid Out
  - Active Subscriptions
  - System Health Status

### 2. User Management

- **Endpoint:** `GET /api/admin/users`, `PUT /api/admin/users/:id`, `DELETE /api/admin/users/:id`
- **Functionality:**
  - **View All Users:** See a paginated list of all registered users with search and filter capabilities.
  - **View User Details:** Click on a user to see their full profile, activity log, balance, and referral history.
  - **Update User:** Modify user details, such as their role (e.g., promote a user to admin) or username.
  - **Ban/Unban User:** Suspend or unsuspend a user's account. Banned users cannot log in or use the platform.
  - **Delete User:** Permanently remove a user and their associated data from the system. **Use with caution.**

### 3. Task Management

- **Endpoint:** `POST /api/admin/tasks/create`, `PUT /api/admin/tasks/:id`, `DELETE /api/admin/tasks/:id`
- **Functionality:**
  - **Create New Tasks:** Add new tasks to the platform, specifying the title, description, reward, category, and instructions.
  - **Update Existing Tasks:** Edit the details of any task.
  - **Activate/Deactivate Tasks:** Control the visibility of tasks to users.
  - **Delete Tasks:** Remove tasks from the platform.

### 4. System Logs

- **Endpoint:** `GET /api/admin/logs`
- View a stream of system-wide activity logs to monitor user actions, system events, and potential errors. Logs can be filtered by severity level (info, warning, error) and user.
