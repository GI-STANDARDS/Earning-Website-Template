/**
 * Authentication Helper Functions
 */

/**
 * Store token and user info in localStorage
 */
function setAuthToken(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  updateAuthUI();
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Check if user is admin
 */
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

/**
 * Logout user
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateAuthUI();
  window.location.href = '/login.html';
}

/**
 * Update UI based on authentication status
 */
function updateAuthUI() {
  const isAuth = isAuthenticated();
  const user = getCurrentUser();
  
  // Update navbar
  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  
  if (isAuth && authButtons) {
    authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'block';
    
    // Update user info in menu
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && user) {
      userNameElement.textContent = `${user.firstName} ${user.lastName}`;
    }
  } else if (!isAuth && authButtons) {
    authButtons.style.display = 'block';
    if (userMenu) userMenu.style.display = 'none';
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
  }
}

/**
 * Require admin - redirect if not admin
 */
function requireAdmin() {
  if (!isAdmin()) {
    window.location.href = '/dashboard/index.html';
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(email, password) {
  try {
    const response = await API.Auth.login(email, password);
    
    if (response.success) {
      setAuthToken(response.token, response.user);
      showNotification('Login successful!', 'success');
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        window.location.href = '/admin/index.html';
      } else {
        window.location.href = '/dashboard/index.html';
      }
    }
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

/**
 * Handle register form submission
 */
async function handleRegister(firstName, lastName, email, password) {
  try {
    const response = await API.Auth.register(firstName, lastName, email, password);
    
    if (response.success) {
      showNotification('Registration successful! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    }
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// Initialize auth UI on page load
document.addEventListener('DOMContentLoaded', updateAuthUI);
