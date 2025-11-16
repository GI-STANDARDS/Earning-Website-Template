# Database Schema

This document outlines the MongoDB database schemas used in the Task Referral Platform.

## 1. User Schema (`User.js`)

- **Collection:** `users`
- **Description:** Stores user account information, authentication details, and profile data.

```javascript
{
  _id: ObjectId,
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  balance: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: ObjectId, ref: 'User', default: null },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'banned'], default: 'active' },
  subscription: {
    planId: { type: ObjectId, ref: 'Plan' },
    status: { type: String, enum: ['active', 'expired', 'none'], default: 'none' },
    expiresAt: Date
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 2. Task Schema (`Task.js`)

- **Collection:** `tasks`
- **Description:** Defines the tasks available for users to complete.

```javascript
{
  _id: ObjectId,
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['survey', 'signup', 'download', 'other'] },
  reward: { type: Number, required: true, min: 0 },
  instructions: { type: String, required: true },
  url: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: ObjectId, ref: 'User', required: true }, // Admin user
  createdAt: Date,
  updatedAt: Date
}
```

## 3. CompletedTask Schema (`CompletedTask.js`)

- **Collection:** `completedtasks`
- **Description:** Tracks which users have completed which tasks and the status of the completion.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  taskId: { type: ObjectId, ref: 'Task', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  proof: String, // User-submitted proof
  earning: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
}
```

## 4. Referral Schema (`Referral.js`)

- **Collection:** `referrals`
- **Description:** Tracks the relationship between referrers and the users they referred.

```javascript
{
  _id: ObjectId,
  referrerId: { type: ObjectId, ref: 'User', required: true }, // The user who owns the code
  referredId: { type: ObjectId, ref: 'User', required: true }, // The new user who signed up
  status: { type: String, enum: ['pending', 'verified'], default: 'pending' }, // Verified when the new user meets criteria
  bonusAmount: { type: Number, default: 0 },
  bonusClaimed: { type: Boolean, default: false },
  createdAt: Date
}
```

## 5. ActivityLog Schema (`ActivityLog.js`)

- **Collection:** `activitylogs`
- **Description:** Logs significant actions performed by users for auditing and tracking.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'login', 'task_completed'
  description: String,
  ipAddress: String,
  severity: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
  createdAt: { type: Date, default: Date.now, expires: '90d' } // Logs auto-delete after 90 days
}
```
