/**
 * Global Utility Functions
 */

/**
 * Show notification toast
 */
function showNotification(message, type = 'info', duration = 3000) {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto remove
  setTimeout(() => {
    notification.remove();
  }, duration);
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format time
 */
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format date and time
 */
function formatDateTime(dateString) {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

/**
 * Truncate text
 */
function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Copy to clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
  } catch (error) {
    showNotification('Failed to copy', 'error');
  }
}

/**
 * Generate random ID
 */
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Validate email
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  const strength = {
    score: 0,
    feedback: []
  };

  if (password.length >= 8) strength.score++;
  else strength.feedback.push('At least 8 characters');

  if (/[a-z]/.test(password)) strength.score++;
  else strength.feedback.push('Lowercase letters');

  if (/[A-Z]/.test(password)) strength.score++;
  else strength.feedback.push('Uppercase letters');

  if (/[0-9]/.test(password)) strength.score++;
  else strength.feedback.push('Numbers');

  if (/[^a-zA-Z0-9]/.test(password)) strength.score++;
  else strength.feedback.push('Special characters');

  strength.level = strength.score <= 2 ? 'weak' : strength.score <= 4 ? 'medium' : 'strong';

  return strength;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Loading indicator
 */
function showLoading() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'block';
}

function hideLoading() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

/**
 * Load dark mode preference
 */
function loadDarkModePreference() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
}

// Load dark mode on page load
document.addEventListener('DOMContentLoaded', loadDarkModePreference);
