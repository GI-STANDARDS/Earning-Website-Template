/**
 * API Configuration and Request Handler
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Make API requests with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    token = null
  } = options;

  const headers = {
    'Content-Type': 'application/json'
  };

  // Add JWT token if available
  const storedToken = token || localStorage.getItem('token');
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Authentication API calls
 */
const Auth = {
  register: async (firstName, lastName, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: { firstName, lastName, email, password }
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST'
    });
  },

  refreshToken: async () => {
    return apiRequest('/auth/refresh-token', {
      method: 'POST'
    });
  }
};

/**
 * User API calls
 */
const User = {
  getProfile: async () => {
    return apiRequest('/users/profile');
  },

  updateProfile: async (updates) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: updates
    });
  },

  getBalance: async () => {
    return apiRequest('/users/balance');
  },

  getActivityLog: async (page = 1, limit = 20) => {
    return apiRequest(`/users/activity?page=${page}&limit=${limit}`);
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/users/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword }
    });
  },

  getDashboardStats: async () => {
    return apiRequest('/users/dashboard-stats');
  }
};

/**
 * Task API calls
 */
const Task = {
  getAll: async (page = 1, limit = 10, category = null) => {
    let url = `/tasks?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    return apiRequest(url);
  },

  getById: async (taskId) => {
    return apiRequest(`/tasks/${taskId}`);
  },

  complete: async (taskId, proof = null) => {
    return apiRequest('/tasks/complete', {
      method: 'POST',
      body: { taskId, proof }
    });
  },

  getCompleted: async (page = 1, limit = 10) => {
    return apiRequest(`/tasks/user/completed?page=${page}&limit=${limit}`);
  }
};

/**
 * Plan API calls
 */
const Plan = {
  getAll: async () => {
    return apiRequest('/plans');
  },

  getById: async (planId) => {
    return apiRequest(`/plans/${planId}`);
  },

  subscribe: async (planId) => {
    return apiRequest('/plans/subscribe', {
      method: 'POST',
      body: { planId }
    });
  },

  getCurrentSubscription: async () => {
    return apiRequest('/plans/user/current');
  },

  confirmSubscription: async (paymentId) => {
    return apiRequest('/plans/confirm-subscription', {
      method: 'POST',
      body: { paymentId }
    });
  }
};

/**
 * Payment API calls
 */
const Payment = {
  initialize: async (paymentId, method) => {
    return apiRequest('/payments/initialize', {
      method: 'POST',
      body: { paymentId, method }
    });
  },

  getHistory: async (page = 1, limit = 10, status = null) => {
    let url = `/payments/history?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return apiRequest(url);
  },

  getDetails: async (paymentId) => {
    return apiRequest(`/payments/${paymentId}`);
  }
};

/**
 * Referral API calls
 */
const Referral = {
  getMyCode: async () => {
    return apiRequest('/referrals/my-code');
  },

  getMyReferrals: async (page = 1, limit = 10) => {
    return apiRequest(`/referrals/my-referrals?page=${page}&limit=${limit}`);
  },

  getEarnings: async () => {
    return apiRequest('/referrals/earnings');
  },

  claimBonus: async (referralId) => {
    return apiRequest(`/referrals/claim-bonus/${referralId}`, {
      method: 'POST'
    });
  },

  getStats: async () => {
    return apiRequest('/referrals/stats');
  }
};

/**
 * Admin API calls
 */
const Admin = {
  getUsers: async (page = 1, limit = 20, search = null, role = null) => {
    let url = `/admin/users?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (role) url += `&role=${role}`;
    return apiRequest(url);
  },

  getUserDetails: async (userId) => {
    return apiRequest(`/admin/users/${userId}`);
  },

  updateUser: async (userId, updates) => {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: updates
    });
  },

  banUser: async (userId, reason = null) => {
    return apiRequest(`/admin/users/${userId}/ban`, {
      method: 'PUT',
      body: { reason }
    });
  },

  deleteUser: async (userId) => {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  getAnalytics: async (period = 30) => {
    return apiRequest(`/admin/analytics?period=${period}`);
  },

  getDashboard: async () => {
    return apiRequest('/admin/dashboard');
  },

  getLogs: async (page = 1, limit = 50, type = null) => {
    let url = `/admin/logs?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    return apiRequest(url);
  },

  clearOldLogs: async (days = 90) => {
    return apiRequest('/admin/logs/clear', {
      method: 'DELETE',
      body: { days }
    });
  }
};

/**
 * System API calls
 */
const System = {
  getHealth: async () => {
    return apiRequest('/misc/health');
  },

  getStatus: async () => {
    return apiRequest('/misc/status');
  },

  getVersion: async () => {
    return apiRequest('/misc/version');
  }
};

// Export API functions
window.API = {
  Auth,
  User,
  Task,
  Plan,
  Payment,
  Referral,
  Admin,
  System
};
