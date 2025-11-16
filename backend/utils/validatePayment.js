/**
 * Validate payment amount
 * @param {Number} amount - Payment amount
 * @returns {Boolean} true if valid, false otherwise
 */
const validateAmount = (amount) => {
  if (typeof amount !== 'number' || amount <= 0) {
    return false;
  }
  // Check if amount is valid currency (max 2 decimal places)
  return Number.isFinite(amount) && amount % 0.01 === 0;
};

/**
 * Validate card number (basic Luhn algorithm)
 * @param {String} cardNumber - Credit card number
 * @returns {Boolean} true if valid format
 */
const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validate expiry date (MM/YY format)
 * @param {String} expiry - Expiry date in MM/YY format
 * @returns {Boolean} true if valid and not expired
 */
const validateExpiry = (expiry) => {
  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expiryYear = parseInt(year);
  const expiryMonth = parseInt(month);
  
  if (expiryYear < currentYear) return false;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
  
  return true;
};

/**
 * Validate CVV (3-4 digits)
 * @param {String} cvv - CVV number
 * @returns {Boolean} true if valid
 */
const validateCVV = (cvv) => {
  const cleaned = cvv.replace(/\D/g, '');
  return cleaned.length >= 3 && cleaned.length <= 4;
};

/**
 * Validate email
 * @param {String} email - Email address
 * @returns {Boolean} true if valid email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 * @param {String} phone - Phone number
 * @returns {Boolean} true if valid format
 */
const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  validateAmount,
  validateCardNumber,
  validateExpiry,
  validateCVV,
  validateEmail,
  validatePhone
};
