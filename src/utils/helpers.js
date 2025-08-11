const crypto = require('crypto');

// Generate unique reference numbers
const generateReferenceNumber = (prefix = 'REF', length = 8) => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`.substring(0, prefix.length + 1 + length);
};

// Generate order number
const generateOrderNumber = () => {
  return generateReferenceNumber('ORD', 12);
};

// Generate quotation number
const generateQuotationNumber = () => {
  return generateReferenceNumber('QUO', 12);
};

// Generate invoice number
const generateInvoiceNumber = () => {
  return generateReferenceNumber('INV', 12);
};

// Generate delivery number
const generateDeliveryNumber = () => {
  return generateReferenceNumber('DEL', 12);
};

// Generate payment number
const generatePaymentNumber = () => {
  return generateReferenceNumber('PAY', 12);
};

// Calculate duration between dates in different units
const calculateDuration = (startDate, endDate, unit = 'days') => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  
  switch (unit) {
    case 'hours':
      return Math.ceil(diffMs / (1000 * 60 * 60));
    case 'days':
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    case 'weeks':
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
    case 'months':
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30));
    case 'years':
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 365));
    default:
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
};

// Calculate rental pricing based on duration
const calculateRentalPrice = (product, duration, unit = 'days') => {
  let unitPrice = 0;
  let actualDuration = duration;
  
  // Convert duration to hours for calculation
  let durationInHours = duration;
  if (unit === 'days') durationInHours = duration * 24;
  else if (unit === 'weeks') durationInHours = duration * 24 * 7;
  else if (unit === 'months') durationInHours = duration * 24 * 30;
  else if (unit === 'years') durationInHours = duration * 24 * 365;
  
  // Find the best pricing tier
  if (durationInHours >= 8760 && product.yearlyRate) { // 1 year
    unitPrice = product.yearlyRate;
    actualDuration = Math.ceil(durationInHours / 8760);
    unit = 'years';
  } else if (durationInHours >= 720 && product.monthlyRate) { // 30 days
    unitPrice = product.monthlyRate;
    actualDuration = Math.ceil(durationInHours / 720);
    unit = 'months';
  } else if (durationInHours >= 168 && product.weeklyRate) { // 7 days
    unitPrice = product.weeklyRate;
    actualDuration = Math.ceil(durationInHours / 168);
    unit = 'weeks';
  } else if (durationInHours >= 24 && product.dailyRate) { // 1 day
    unitPrice = product.dailyRate;
    actualDuration = Math.ceil(durationInHours / 24);
    unit = 'days';
  } else if (product.hourlyRate) {
    unitPrice = product.hourlyRate;
    actualDuration = durationInHours;
    unit = 'hours';
  } else {
    // Fallback to base price per day
    unitPrice = product.basePrice;
    actualDuration = Math.ceil(durationInHours / 24);
    unit = 'days';
  }
  
  return {
    unitPrice: parseFloat(unitPrice),
    actualDuration,
    unit,
    totalPrice: parseFloat(unitPrice) * actualDuration
  };
};

// Format currency (Indian Rupees)
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date for display
const formatDate = (date, format = 'short') => {
  const dateObj = new Date(date);
  
  const options = {
    short: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    },
    long: { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    },
    datetime: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  return dateObj.toLocaleDateString('en-IN', options[format] || options.short);
};

// Calculate late fee
const calculateLateFee = (returnDate, actualReturnDate, dailyLateFee, maxLateFee = null) => {
  if (!actualReturnDate || actualReturnDate <= returnDate) {
    return 0;
  }
  
  const lateDays = calculateDuration(returnDate, actualReturnDate, 'days');
  let lateFee = lateDays * dailyLateFee;
  
  if (maxLateFee && lateFee > maxLateFee) {
    lateFee = maxLateFee;
  }
  
  return {
    lateDays,
    dailyRate: dailyLateFee,
    totalLateFee: lateFee
  };
};

// Calculate tax amount
const calculateTax = (amount, taxPercentage = 18) => {
  const taxAmount = (amount * taxPercentage) / 100;
  return {
    taxableAmount: amount,
    taxPercentage,
    taxAmount,
    totalAmount: amount + taxAmount
  };
};

// Apply discount
const applyDiscount = (amount, discountType, discountValue) => {
  let discountAmount = 0;
  
  if (discountType === 'percentage') {
    discountAmount = (amount * discountValue) / 100;
  } else if (discountType === 'fixed') {
    discountAmount = Math.min(discountValue, amount);
  }
  
  return {
    originalAmount: amount,
    discountType,
    discountValue,
    discountAmount,
    finalAmount: amount - discountAmount
  };
};

// Check if date is in business hours
const isBusinessHours = (date, businessHours = { start: 9, end: 18 }) => {
  const hour = new Date(date).getHours();
  return hour >= businessHours.start && hour < businessHours.end;
};

// Get next business day
const getNextBusinessDay = (date, skipWeekends = true) => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  if (skipWeekends) {
    // Skip weekends (0 = Sunday, 6 = Saturday)
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
  }
  
  return nextDay;
};

// Paginate array
const paginate = (array, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const paginatedItems = array.slice(offset, offset + limit);
  
  return {
    data: paginatedItems,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      itemsPerPage: limit,
      hasNextPage: offset + limit < array.length,
      hasPrevPage: page > 1
    }
  };
};

// Generate random color (for charts/UI)
const generateRandomColor = () => {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Sanitize filename
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
};

// Generate slug from text
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

// Sleep/delay function
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Generate OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

module.exports = {
  generateReferenceNumber,
  generateOrderNumber,
  generateQuotationNumber,
  generateInvoiceNumber,
  generateDeliveryNumber,
  generatePaymentNumber,
  calculateDuration,
  calculateRentalPrice,
  formatCurrency,
  formatDate,
  calculateLateFee,
  calculateTax,
  applyDiscount,
  isBusinessHours,
  getNextBusinessDay,
  paginate,
  generateRandomColor,
  sanitizeFilename,
  generateSlug,
  deepClone,
  isEmpty,
  sleep,
  generateOTP
};