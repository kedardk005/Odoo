const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

const validateZipCode = (zipCode) => {
  const zipRegex = /^\d{5,6}$/;
  return zipRegex.test(zipCode);
};

const validateSKU = (sku) => {
  const skuRegex = /^[A-Z0-9\-_]{3,20}$/;
  return skuRegex.test(sku);
};

const validatePrice = (price) => {
  return typeof price === 'number' && price >= 0 && price <= 999999.99;
};

const validateQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity >= 0;
};

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  return start < end && start >= now;
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>\"']/g, '');
};

const validateRequired = (fields, data) => {
  const missing = [];
  
  fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  });
  
  return missing;
};

const validateEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

const validateFileType = (filename, allowedTypes) => {
  const ext = filename.toLowerCase().split('.').pop();
  return allowedTypes.includes(ext);
};

const validateImageFile = (file) => {
  const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return {
    isValid: validateFileType(file.originalname, allowedTypes) && file.size <= maxSize,
    message: !validateFileType(file.originalname, allowedTypes) 
      ? 'Invalid file type. Only jpg, jpeg, png, gif, webp are allowed.'
      : file.size > maxSize 
      ? 'File size too large. Maximum 5MB allowed.'
      : ''
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateZipCode,
  validateSKU,
  validatePrice,
  validateQuantity,
  validateDateRange,
  sanitizeString,
  validateRequired,
  validateEnum,
  validateFileType,
  validateImageFile
};