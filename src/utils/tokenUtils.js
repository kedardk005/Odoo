const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId, 
      role: role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { 
      userId: userId,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '30d' 
    }
  );
};

const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

const generateResetToken = (userId) => {
  return jwt.sign(
    { 
      userId: userId,
      type: 'password_reset'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '1h' 
    }
  );
};

const generateVerificationToken = (userId) => {
  return jwt.sign(
    { 
      userId: userId,
      type: 'email_verification'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '24h' 
    }
  );
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  generateVerificationToken
};