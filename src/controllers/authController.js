const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserNotificationPreference = require('../models/UserNotificationPreference');
const { sendEmail } = require('../services/emailService');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { validateEmail, validatePassword } = require('../utils/validation');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode,
        customerType = 'individual'
      } = req.body;

      // Validation
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long with at least one uppercase, lowercase, and number'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Get user role ID (default to 'user' role)
      const Role = require('../models/Role');
      const userRole = await Role.findOne({ where: { role_name: 'user' } });
      
      if (!userRole) {
        return res.status(500).json({
          success: false,
          message: 'User role not found in system'
        });
      }

      // Create new user
      const user = await User.create({
        email,
        password_hash: password, // Use password_hash field
        full_name: `${firstName} ${lastName}`, // Use full_name field
        phone_number: phone, // Use phone_number field
        role_id: userRole.role_id // Default to user role
      });

      // TODO: Create default notification preferences when model is fixed
      // await UserNotificationPreference.create({ user_id: user.user_id });

      // Generate tokens
      const token = generateToken(user.user_id, 'user');
      const refreshToken = generateRefreshToken(user.user_id);

      // Send welcome email
      try {
        await sendEmail({
          to: user.email,
          subject: 'Welcome to Rental Management System',
          template: 'welcome',
          data: {
            firstName: firstName, // Use the firstName from request body
            email: user.email
          }
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  },

  // User login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user with role information
      const Role = require('../models/Role');
      const user = await User.findOne({ 
        where: { email },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_id', 'role_name']
          }
        ]
      });

      if (!user || !(await user.validatePassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Get user role
      const userRole = user.role?.role_name || 'user';

      // Generate tokens with actual role
      const token = generateToken(user.user_id, userRole);
      const refreshToken = generateRefreshToken(user.user_id);

      // Determine redirect page based on role
      const redirectPage = userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard';

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            phone_number: user.phone_number,
            role: userRole,
            role_id: user.role_id
          },
          token,
          refreshToken,
          user_type: userRole,
          redirect_to: redirectPage,
          permissions: this.getRolePermissions(userRole)
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  },

  // Get role-based permissions
  getRolePermissions: (role) => {
    const permissions = {
      user: {
        can_view_products: true,
        can_create_quotations: true,
        can_view_own_orders: true,
        can_view_own_invoices: true,
        can_update_profile: true,
        can_view_notifications: true,
        dashboard_type: 'customer'
      },
      admin: {
        can_view_products: true,
        can_create_products: true,
        can_edit_products: true,
        can_delete_products: true,
        can_view_all_orders: true,
        can_create_quotations: true,
        can_confirm_orders: true,
        can_create_invoices: true,
        can_view_all_invoices: true,
        can_manage_deliveries: true,
        can_view_reports: true,
        can_manage_users: true,
        can_configure_pricing: true,
        can_manage_inventory: true,
        dashboard_type: 'admin'
      }
    };

    return permissions[role] || permissions.user;
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      // TODO: Include notification preferences when associations are fixed

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error.message
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode
      } = req.body;

      const user = await User.findByPk(req.user.id);
      
      await user.update({
        full_name: `${firstName} ${lastName}`,
        phone_number: phone
        // Note: address, city, state, zipCode fields don't exist in current schema
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (!validatePassword(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long with at least one uppercase, lowercase, and number'
        });
      }

      const user = await User.scope('withPassword').findByPk(req.user.id);

      if (!(await user.validatePassword(currentPassword))) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      await user.update({ password: newPassword });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message
      });
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If the email exists, password reset instructions have been sent'
        });
      }

      // Generate reset token (expires in 1 hour)
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Send reset email
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'password_reset',
        data: {
          firstName: user.firstName,
          resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        }
      });

      res.json({
        success: true,
        message: 'Password reset instructions have been sent to your email'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        error: error.message
      });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required'
        });
      }

      if (!validatePassword(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long with at least one uppercase, lowercase, and number'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== 'password_reset') {
        return res.status(400).json({
          success: false,
          message: 'Invalid token type'
        });
      }

      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid token'
        });
      }

      await user.update({ password: newPassword });

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        error: error.message
      });
    }
  },

  // Verify email
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid token'
        });
      }

      await user.update({ emailVerified: true });

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  },

  // Resend verification email
  resendVerification: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified'
        });
      }

      const verificationToken = jwt.sign(
        { userId: user.id, type: 'email_verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      await sendEmail({
        to: user.email,
        subject: 'Email Verification',
        template: 'email_verification',
        data: {
          firstName: user.firstName,
          verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
        }
      });

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: error.message
      });
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findByPk(decoded.userId);

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const newToken = generateToken(user.id, user.role);
      const newRefreshToken = generateRefreshToken(user.id);

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      // In a real application, you might want to blacklist the token
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }
};

module.exports = authController;