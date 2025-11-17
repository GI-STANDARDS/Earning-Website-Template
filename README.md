# Earning Website

A full-featured earning platform starter project built with PHP and MySQL. This repository provides a **complete, ready-to-develop structure** for a task-based earning system with both **User Panel** and **Admin Panel**.

The goal of this project skeleton is to let you focus on business logic while using a clean, modular, and extensible architecture.

---

## Table of Contents
- [Features](#features)
  - [User Panel](#user-panel)
  - [Admin Panel](#admin-panel)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup & Installation](#setup--installation)
- [Development Plan & Progress Tracker](#development-plan--progress-tracker)
- [Coding Guidelines](#coding-guidelines)
- [Future Enhancements](#future-enhancements)

---

## Features

### User Panel
- Authentication pages: `login.php`, `register.php`, `logout.php` (placeholders wired to shared layout).
- **Dashboard**: Overview of balance, completed tasks, referrals, and active plans.
- **Profile**: Placeholder for editing name, email, avatar, and password.
- **Tasks**: Listing of available tasks with reward preview.
- **Earning History**: Placeholder table for all transactions (tasks, referrals, subscriptions).
- **Subscriptions**: Placeholder plan catalog (free & paid tiers).
- **Referrals**: Placeholder referral link + earnings overview.

### Admin Panel
- **Dashboard**: High-level stats cards (users, earnings, tasks, plans).
- **User Management**: Placeholder table for viewing and managing users.
- **Tasks Management**: Placeholder forms and sections for CRUD operations on tasks.
- **Plans Management**: Placeholder configuration for subscription/earning plans.
- **Earnings Overview**: Space reserved for charts and transaction reports.
- **Settings**: Placeholder for global site options.

All pages are wired into a **shared Bootstrap-based layout** (`includes/header.php` and `includes/footer.php`) and can be progressively enhanced.

---

## Tech Stack

- **Language**: PHP (7.4+ recommended)
- **Database**: MySQL / MariaDB
- **Frontend**:
  - HTML5, CSS3, JavaScript (ES6)
  - Bootstrap 5 (via CDN)
  - Font Awesome (via CDN)
- **Optional Libraries (recommended later)**:
  - Chart.js for admin analytics.
  - PHPMailer or similar for email/SMTP.
  - DataTables for advanced tables in admin.

---

## Folder Structure

```text
earning-website/
├── index.php              # Public landing page
├── login.php              # User login (placeholder)
├── register.php           # User registration (placeholder)
├── logout.php             # User logout (implemented redirect)
├── dashboard.php          # User dashboard skeleton
├── profile.php            # User profile/account page
├── earnings.php           # User earning history
├── subscription.php       # User subscription/plan page
├── tasks.php              # User tasks listing
├── referrals.php          # User referral dashboard
│
├── admin/                 # Admin panel (separate namespace)
│   ├── index.php          # Admin dashboard
│   ├── users.php          # User management
│   ├── tasks.php          # Task management
│   ├── plans.php          # Plan/subscription management
│   ├── earnings.php       # Earnings overview & reports
│   └── settings.php       # Global site settings
│
├── assets/
│   ├── css/
│   │   └── style.css      # Main stylesheet (modern, responsive base styles)
│   ├── js/
│   │   └── script.js      # Global JS (alerts, UI helpers, placeholders)
│   └── images/            # Place for logos and UI images
│
├── includes/
│   ├── db.php             # PDO connection + basic table bootstrap
│   ├── header.php         # Shared HTML <head> and main navbar
│   ├── footer.php         # Shared footer + scripts
│   └── functions.php      # Common helpers (auth checks, redirects, flash)
│
├── config/
│   └── config.php         # Database credentials, base constants, session
│
├── vendor/                # Composer / third-party libraries (empty by default)
│
├── README.md              # You are here
└── LICENSE                # Project license (MIT by default)
```

---

## Setup & Installation

### 1. Prerequisites

- PHP 7.4 or higher (8.x recommended)
- MySQL or MariaDB
- Web server (Apache / Nginx)
- Composer (optional, for future dependencies)

### 2. Database

1. Create a database, e.g. `earning_website`.
2. Update credentials in `config/config.php`:
   - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`.
3. On first load, `includes/db.php` will connect via PDO and **auto-create core tables** using simple `CREATE TABLE IF NOT EXISTS` statements.

> For production, you may later extract these into versioned migrations or SQL dump files.

### 3. Project Configuration

1. Place the `earning-website` folder inside your web root.
2. Make sure `SITE_URL` in `config/config.php` matches the actual URL (e.g. `http://localhost/earning-website`).
3. Ensure PHP sessions are working (session startup is configured in `config/config.php`).

### 4. Running Locally

- Navigate to `http://localhost/earning-website` in your browser.
- Use the placeholder navigation to move between:
  - User pages: Dashboard, Tasks, Earnings, Subscription, Referrals, Profile.
  - Admin pages: `http://localhost/earning-website/admin/` (will require `is_admin` session flag — currently stubbed).

> At this stage, pages are **UI skeletons** only. No actual authentication or earning logic is implemented yet.

---

## Development Plan & Progress Tracker

Use this section as the **project manager** for the earning website. Each phase groups related tasks and clearly shows dependencies, integration points, and security notes.

Legend: ✅ Completed &nbsp;|&nbsp; ⚙ In Progress &nbsp;|&nbsp; ⬜ Pending

> **Tip:** Work phase by phase in order. Do not enable later features (e.g. subscriptions, referrals) until their prerequisites in earlier phases are completed.

---

### Phase 1 – Project Setup & Database Configuration

Goal: Have a runnable PHP project with configuration, database connection, and base tables ready.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 1 | Create project folder structure                  | ✅ Completed | –           | Matches `Folder Structure` section. |
| 2 | Configure `config/config.php`                    | ✅ Completed | #1          | Defines DB constants, `SITE_NAME`, `SITE_URL`, and starts session. |
| 3 | Implement `includes/db.php` with PDO             | ✅ Completed | #2          | `Database` class + `$pdo` global; uses `CREATE TABLE IF NOT EXISTS` for core tables. |
| 4 | Verify DB connection in browser                  | ⬜ Pending   | #3          | Open `index.php`; ensure no connection or PDO errors. |

**Security notes (Phase 1):**
- Limit DB user privileges in production (no `GRANT ALL`).
- Use strong DB password and non-default username.

---

### Phase 2 – User Authentication (Register/Login + Session Handling)

Goal: Allow users to register, log in, and log out securely; protect authenticated pages.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 5 | Design `users` table fields (email, password, etc.) | ✅ Completed | Phase 1     | Basic structure created in `includes/db.php`; extended with `is_admin`, `is_active`, `last_login`. |
| 6 | Implement registration logic in `register.php`   | ✅ Completed | #5          | Uses `password_hash()`, server-side validation, prepared statements, and referral code support. |
| 7 | Implement login logic in `login.php`             | ✅ Completed | #5, #6      | Uses `password_verify()`, sets session variables, updates `last_login`, and redirects based on role. |
| 8 | Wire logout in `logout.php` (session destroy)    | ✅ Completed | #7          | Clears session and redirects to `login.php`. |
| 9 | Enforce `require_login()` on protected user pages | ✅ Completed | #7          | Applied to `dashboard.php`, `profile.php`, `earnings.php`, `subscription.php`, `tasks.php`, `referrals.php`. |

**Security notes (Phase 2):**
- Hash all passwords with `password_hash()`; never store plain text.
- Verify passwords with `password_verify()`.
- Use prepared statements for all auth-related queries.
- Regenerate session ID on successful login (`session_regenerate_id(true)`).

**File integration examples (Phase 2):**

Typical user page entry pattern:

```php
<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';
require_login();

$page_title = 'Dashboard - ' . SITE_NAME;
require_once __DIR__ . '/includes/header.php';
?>
<!-- Page content here -->
<?php require_once __DIR__ . '/includes/footer.php'; ?>
```

`functions.php` already includes `db.php`, so DB access is available wherever `functions.php` is loaded.

---

### Phase 3 – User Panel Pages

Goal: Implement full functionality for all user-facing pages.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 10 | Finalize `dashboard.php`                        | ✅ Completed | Phase 2     | Shows real stats from DB: balance, total earnings, completed tasks, referrals, active plans. |
| 11 | Implement `profile.php` editing                 | ✅ Completed | Phase 2     | Updates full name/email/avatar/password with validation, hashing, and prepared statements. |
| 12 | Implement `tasks.php` dynamic listing           | ✅ Completed | Phase 1     | Lists active tasks with status per user via `user_tasks`. |
| 13 | Implement task completion workflow              | ✅ Completed | #12         | Completion inserts/updates `user_tasks`, credits `transactions`, and updates balance in a transaction. |
| 14 | Implement `earnings.php` history table          | ✅ Completed | Phase 1     | Reads `transactions` for current user and shows credits/debits with badges. |
| 15 | Implement `subscription.php` plan listing       | ✅ Completed | Phase 4     | Lists active plans from `subscriptions` and manages `user_subscriptions` with safe updates. |
| 16 | Implement `referrals.php` data                  | ✅ Completed | Phase 2     | Generates referral link from `users.referral_code`, lists referred users and referral earnings. |

**Integration notes (Phase 3):**
- All user pages must include `config.php`, `functions.php`, `header.php`, and `footer.php` in the order shown in Phase 2 example.
- Use helper functions like `current_user()` to avoid duplicating user fetch logic.

---

### Phase 4 – Admin Panel Pages

Goal: Provide full admin control over users, tasks, plans, and earnings.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 17 | Implement `require_admin()` checks everywhere   | ✅ Completed | Phase 2     | Already exists in `functions.php`; called at top of all admin pages. |
| 18 | Complete `admin/index.php` metrics              | ✅ Completed | Phase 1     | Aggregated totals for users, earnings, tasks, and active plans. |
| 19 | Implement `admin/users.php` management actions  | ✅ Completed | Phase 2     | List + filter users; adjust balance, toggle active/admin, lock/unlock withdrawals, and view activity/referrals. |
| 20 | Implement `admin/tasks.php` CRUD                | ✅ Completed | Phase 1     | Create/edit/delete tasks, toggle active, and assign tasks to single users or all active users. |
| 21 | Implement `admin/plans.php` CRUD                | ✅ Completed | Phase 1     | Manage subscription plans in `subscriptions` table (name, price, duration, earnings, active flag). |
| 22 | Implement `admin/earnings.php` reports          | ✅ Completed | Phase 1     | Summary of credits/debits + filterable recent transactions by user email, type, and date range. |
| 23 | Implement `admin/settings.php` options          | ✅ Completed | Phase 1     | Simple `settings` table; configure referral rewards, default task reward, default plan price, and notifications flag. |

**Admin file integration pattern:**

```php
<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_admin();

$page_title = 'Admin Dashboard - ' . SITE_NAME;
require_once __DIR__ . '/../includes/header.php';
?>
<!-- Admin content here -->
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
```

---

### Phase 5 – Withdrawals Module

Goal: Allow users to request payouts and admins to securely approve or reject withdrawals.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 24 | Design `withdrawals` table and helpers          | ✅ Completed | Phases 1–4  | Added `withdrawals` table in `includes/db.php` plus helpers like `get_user_balance()` and `get_withdrawable_amount()`. |
| 25 | Implement `withdrawals.php` user page           | ✅ Completed | Phase 2     | Protected by `require_login()`. Shows balance, withdrawable amount (excluding pending), respects `withdrawals_locked`, and lists user withdrawal history. |
| 26 | Implement `admin/withdrawals.php` workflow      | ✅ Completed | Phases 2,4  | Protected by `require_admin()`. Lists requests with filters; admins can approve (debit balance + create transaction) or reject with optional notes. |
| 27 | Integrate navigation and header/footer           | ✅ Completed | #24–#26     | Added user "Withdrawals" link and admin "Withdrawals" dropdown item in `includes/header.php`; pages use shared layout and flash messaging. |

**Integration notes (Phase 5):**
- All withdrawal actions use prepared statements and server-side validation.
- User requests are blocked if `users.withdrawals_locked` is set or if the requested amount exceeds the withdrawable amount.
- Admin approvals update both `users.balance` and `transactions` to keep earnings history consistent.

---

### Phase 6 – Frontend Design & CSS

Goal: Make the UI modern, responsive, and pleasant to use.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 28 | Define base styles in `assets/css/style.css`    | ✅ Completed | Phase 1     | Includes cards, typography, task items, dashboard stats, footer, animations. |
| 29 | Fine-tune responsive behavior                   | ⬜ Pending   | #28         | Test on mobile/tablet; adjust grid and spacing. |
| 30 | Add UI micro-interactions (hover, focus, etc.)  | ⬜ Pending   | #28         | Use CSS transitions and small JS hooks where needed. |

---

### Phase 7 – Security & Validation

Goal: Harden the application against common attacks.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 31 | Server-side validation for all forms            | ⬜ Pending   | Phases 2–4  | Validate email, password strength, plan/task inputs, etc. |
| 32 | Add CSRF protection to forms                    | ⬜ Pending   | Phase 2     | Generate tokens per session + form; verify on POST requests. |
| 33 | Enforce prepared statements everywhere          | ⬜ Pending   | Phase 1     | All queries via PDO prepared statements, no string concatenation. |
| 34 | Strengthen session security                      | ⬜ Pending   | Phase 2     | Use `httponly` cookies, consider `secure` flag, regenerate IDs on login. |
| 35 | Optional brute-force protection                  | ⬜ Pending   | Phase 2     | Lockout or throttle after repeated failed logins. |

**Security mapping:**
- Authentication security lives primarily in Phase 2 tasks (#6–#9 + #31–#35).
- Admin authorization logic centers on `require_admin()` and careful use of IDs/permissions.

---

### Phase 8 – File & Navigation Connections

Goal: Ensure all files are correctly linked, with no broken includes or redirects.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 36 | Audit all `require`/`require_once` paths        | ⬜ Pending   | Phases 1–5  | Confirm relative paths (`__DIR__`) are correct for root vs. admin pages. |
| 37 | Verify navigation links in header/footer        | ⬜ Pending   | Phase 5     | Ensure links match actual filenames and `SITE_URL`. |
| 38 | Test redirects after login/logout               | ⬜ Pending   | Phase 2     | Verify user goes to `dashboard.php` and logout returns to `login.php`. |
| 39 | Test admin navigation & role enforcement        | ⬜ Pending   | Phases 2,4  | Ensure non-admin users cannot access `/admin/*` URLs. |

**Global integration rules:**
- **User pages**: use `config.php` + `functions.php` + `header.php` + `footer.php`.
- **Admin pages**: same as user, but paths prefixed with `../` and always call `require_admin()`.
- **Database access**: always go through `$pdo` from `db.php` (available via `functions.php`).

---

### Phase 9 – Testing & Debugging

Goal: Confirm the system behaves as expected and is free of runtime errors.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 40 | Manual UI walkthrough (user flows)              | ⬜ Pending   | Phases 2–3  | Register, login, complete tasks, view earnings, manage profile. |
| 41 | Manual UI walkthrough (admin flows)             | ⬜ Pending   | Phases 2,4  | Manage users, tasks, plans, review earnings. |
| 42 | Enable error logging in production              | ⬜ Pending   | Phase 1     | Log to file instead of screen; keep display_errors off in production. |

---

### Phase 10 – Documentation & README Updates

Goal: Keep project documentation in sync with implementation.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 43 | Update README with implementation details       | ⚙ In Progress | All phases | Reflect new endpoints, ENV variables, and caveats as they are added. |
| 44 | Document database schema and relationships      | ⬜ Pending   | Phase 1     | Add diagrams or SQL snippets describing tables and foreign keys. |

---

### Phase 11 – Optional Enhancements (UX, Gamification, Analytics)

Goal: Add value-added features once core functionality is stable.

| # | Task / Sub-task                                  | Status      | Dependencies | Notes |
|---|--------------------------------------------------|------------|-------------|-------|
| 45 | Interactive charts with Chart.js                | ⬜ Pending   | Phase 4     | Visualize earnings in `admin/earnings.php` and optionally on user dashboard. |
| 46 | Dark mode & theme toggle                        | ⬜ Pending   | Phase 6     | Store preference per user (DB) or in localStorage. |
| 47 | Gamification: badges & leaderboards             | ⬜ Pending   | Phases 3–4  | Track milestones (tasks completed, referrals) and highlight top users. |
| 48 | Smooth UI animations                            | ⬜ Pending   | Phase 6     | Use CSS transitions and small JS animations for cards, modals, etc. |
| 49 | Email/SMTP integration                          | ⬜ Pending   | Phase 2     | Use PHPMailer for verification, password reset, and notifications. |
| 50 | Notification center                             | ⬜ Pending   | Phases 2–4  | Centralize in-app notifications; optionally tie into email.

Update these phase tables frequently as you work; they are intended to be your **single source of truth** for progress and priorities.

---

## Coding Guidelines

- **Modular PHP**:
  - Put shared helpers in `includes/functions.php`.
  - Keep DB access confined to reusable functions or repository-style helpers.
- **Layout**:
  - All pages should include `includes/header.php` and `includes/footer.php`.
  - Set `$page_title` before including the header for meaningful `<title>` values.
- **Security (to implement later)**:
  - Always use prepared statements (PDO) for queries.
  - Hash passwords with `password_hash()` and verify with `password_verify()`.
  - Add CSRF tokens on state-changing forms (login, register, task actions, admin forms).
  - Validate and sanitize all user input server-side.

---

## Future Enhancements

These ideas go beyond the basic spec but are recommended for a more professional product:

- **Interactive charts** (admin earnings, user performance) using Chart.js.
- **Dark mode** with a theme toggle, stored in user profile or local storage.
- **Gamification**: badges for milestones, leaderboards for top earners/referrers.
- **Withdrawal module**: track payout requests, approval workflow, and history.
- **Notification center**: in-app notifications and optional email alerts.
- **Multi-language support**: simple translation layer + language switcher.
- **API layer**: JSON endpoints for mobile apps or SPA frontend.

This scaffold is intentionally lean but opinionated. Extend it iteratively, keeping the code modular, secure, and easy to maintain.
