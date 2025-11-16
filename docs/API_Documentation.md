# API Documentation

This document provides detailed information about the API endpoints for the Task Referral Platform.

**Base URL:** `/api`

## Authentication

All routes that require authentication expect a JWT in the `Authorization` header: `Authorization: Bearer <token>`.

### `POST /auth/register`

Registers a new user.

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "referralCode": "ABC12345" // Optional
}
```

**Responses:**
- `201 Created`: Registration successful.
- `400 Bad Request`: Validation error (e.g., weak password, invalid email).
- `409 Conflict`: Email already exists.

---

### `POST /auth/login`

Logs in a user and returns a JWT.

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Responses:**
- `200 OK`: Login successful. Returns `{ token, user }`.
- `401 Unauthorized`: Invalid credentials.

---

### `POST /auth/logout`

Logs out a user (server-side token invalidation if implemented).

**Responses:**
- `200 OK`: Logout successful.

---

### `POST /auth/refresh-token`

Provides a new JWT if the old one is expired but a valid refresh token is present.

**Responses:**
- `200 OK`: Returns `{ token }`.
- `401 Unauthorized`: Invalid or expired refresh token.

## Users

*Authentication required for all endpoints.*

### `GET /users/profile`

Retrieves the profile of the currently authenticated user.

**Responses:**
- `200 OK`: Returns user profile object.

---

### `PUT /users/profile`

Updates the profile of the currently authenticated user.

**Request Body:**
```json
{
  "username": "new_username",
  "profile": { "bio": "A new bio" }
}
```

**Responses:**
- `200 OK`: Profile updated successfully.

---

### `GET /users/balance`

Gets the current balance for the authenticated user.

**Responses:**
- `200 OK`: Returns `{ balance, lifetimeEarnings }`.

---

### `GET /users/activity`

Gets the activity log for the authenticated user, with pagination.

**Query Parameters:**
- `page` (number, optional): Page number for pagination.
- `limit` (number, optional): Number of items per page.

**Responses:**
- `200 OK`: Returns a paginated list of activity log entries.

## Tasks

*Authentication required for all endpoints.*

### `GET /tasks`

Retrieves a list of available tasks. Supports filtering and pagination.

**Query Parameters:**
- `page`, `limit`, `category`, `status`

**Responses:**
- `200 OK`: Returns a paginated list of tasks.

---

### `GET /tasks/:id`

Retrieves a single task by its ID.

**Responses:**
- `200 OK`: Returns the task object.
- `404 Not Found`: Task not found.

---

### `POST /tasks/complete`

Allows a user to mark a task as complete.

**Request Body:**
```json
{
  "taskId": "60c72b2f9b1d8c001f8e4c8b",
  "proof": "Screenshot or text proof of completion." // Optional
}
```

**Responses:**
- `200 OK`: Task completion submitted for review.

---

### `GET /tasks/user/completed`

Retrieves all tasks completed by the authenticated user.

**Responses:**
- `200 OK`: Returns a list of completed tasks.

## Referrals

*Authentication required for all endpoints.*

### `GET /referrals/my-code`

Gets the authenticated user's unique referral code and link.

**Responses:**
- `200 OK`: Returns `{ code, link }`.

---

### `GET /referrals/my-referrals`

Gets a list of users who registered using the authenticated user's referral code.

**Responses:**
- `200 OK`: Returns a list of referral objects.

---

### `GET /referrals/earnings`

Gets a summary of earnings from referrals.

**Responses:**
- `200 OK`: Returns `{ totalEarnings, pendingBonus, claimedBonus }`.

---

### `GET /referrals/stats`

Gets referral statistics (e.g., total referrals, conversion rate).

**Responses:**
- `200 OK`: Returns `{ totalReferrals, verifiedReferrals, conversionRate }`.

---

### `POST /referrals/claim-bonus/:referralId`

Claims a pending bonus for a specific verified referral.

**Responses:**
- `200 OK`: Bonus claimed successfully.
- `400 Bad Request`: Bonus not available or already claimed.

## Admin

*Admin role and authentication required.*

### `GET /admin/users`

Retrieves a list of all users.

---

### `PUT /admin/users/:id`

Updates a specific user's details.

---

### `DELETE /admin/users/:id`

Deletes a user.

---

### `POST /admin/tasks/create`

Creates a new task.

---

### `GET /admin/analytics`

Retrieves system-wide analytics and metrics.

---

### `GET /admin/logs`

Retrieves system activity logs.
