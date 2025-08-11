# RentPro - Complete Setup Guide

## Overview
RentPro is a comprehensive rental management platform designed for equipment and inventory tracking. This guide will help you set up the entire system on any PC.

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Gmail account for email notifications
- Razorpay account for payment processing

## 1. Installation

### Clone/Download the Project
```bash
# If using git
git clone <repository-url>
cd rentpro

# Or download and extract the project files
```

### Install Dependencies
```bash
npm install
```

## 2. Database Setup

### Option A: Use Neon Database (Recommended)
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string

### Option B: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a new database:
```sql
CREATE DATABASE rentpro;
```
3. Note down your connection details

### Initialize Database Schema
```bash
# Push schema to database
npm run db:push
```

## 3. Environment Variables Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/rentpro"
PGHOST="localhost"
PGPORT="5432"
PGUSER="your_username"
PGPASSWORD="your_password"
PGDATABASE="rentpro"

# Email Configuration (Gmail SMTP)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Razorpay Configuration
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_secret_key"
VITE_RAZORPAY_KEY_ID="rzp_test_your_key_id"

# Session Secret (generate a random string)
SESSION_SECRET="your-super-secret-session-key-here"
```

## 4. Third-Party Service Setup

### Gmail SMTP Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in EMAIL_PASS

### Razorpay Setup
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to Settings → API Keys
3. Generate Test API Keys
4. Copy Key ID and Key Secret to environment variables

## 5. Database Schema and Initial Data

The system will automatically create all necessary tables. To add sample data:

### Admin User Creation
```sql
INSERT INTO users (id, email, password, first_name, last_name, role, phone, address) 
VALUES (
  'admin-uuid', 
  'admin@rentpro.com', 
  'admin123', 
  'Admin', 
  'User', 
  'admin', 
  '+1234567890', 
  '123 Admin Street'
);
```

### Sample Categories
```sql
INSERT INTO categories (name, description) VALUES 
('Construction Equipment', 'Heavy machinery and construction tools'),
('Audio/Visual', 'Sound systems, projectors, lighting equipment'),
('Party & Events', 'Tables, chairs, tents, decorations'),
('Transportation', 'Vehicles, trucks, moving equipment');
```

### Sample Products
```sql
INSERT INTO products (name, description, category_id, hourly_rate, daily_rate, weekly_rate, monthly_rate, security_deposit, quantity, available_quantity, status) VALUES
('Excavator - CAT 320', 'Heavy duty excavator for construction work', (SELECT id FROM categories WHERE name = 'Construction Equipment'), 500, 3000, 18000, 65000, 50000, 2, 2, 'available'),
('Professional Sound System', 'Complete PA system with speakers and mixer', (SELECT id FROM categories WHERE name = 'Audio/Visual'), 100, 800, 4500, 15000, 5000, 3, 3, 'available'),
('Wedding Tent (50 Person)', 'Large white tent for outdoor events', (SELECT id FROM categories WHERE name = 'Party & Events'), 200, 1500, 9000, 30000, 10000, 5, 5, 'available');
```

## 6. Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

The application will be available at:
- **Development**: http://localhost:5000
- **Production**: http://localhost:5000

## 7. Default Login Credentials

### Admin Access
- **Email**: admin@rentpro.com
- **Password**: admin123

### Customer Registration
Customers can register through the signup page or admin can create customer accounts.

## 8. Features Overview

### Admin Module
- **Dashboard**: Overview of business metrics and recent activity
- **Products**: Complete inventory management with categories
- **Orders**: Order processing and status management
- **Customers**: Customer database and management
- **Booking**: Create new rental orders
- **Quotations**: Quotation management and conversion to orders
- **Pricing**: Dynamic pricing rules and customer segments

### Customer Module
- **Product Browsing**: Search and filter rental equipment
- **Quotation Requests**: Request quotes for rental items
- **Order Management**: View order history and status
- **Payment Integration**: Secure payments via Razorpay
- **Email Notifications**: Automated confirmations and updates

### Core Features
- **Real-time Inventory**: Live availability tracking
- **Payment Processing**: Integrated Razorpay gateway
- **Email Notifications**: PDF invoices and confirmations
- **Responsive Design**: Mobile-friendly interface
- **Database Persistence**: All data stored in PostgreSQL
- **PDF Generation**: Professional invoices and quotations

## 9. Customization

### Branding
- Update logo and colors in `client/src/index.css`
- Modify company name in email templates (`server/email.ts`)

### Pricing Structure
- Configure pricing rules through the admin panel
- Modify calculation logic in pricing components

### Email Templates
- Customize email content in `server/email.ts`
- Update PDF layout in invoice generation functions

## 10. Deployment

### Using Replit (Recommended)
1. Import project to Replit
2. Set environment variables in Replit Secrets
3. Use Replit's built-in PostgreSQL database
4. Deploy using Replit Deployments

### Traditional Server Deployment
1. Set up Node.js environment
2. Configure reverse proxy (nginx/Apache)
3. Set up SSL certificates
4. Configure environment variables
5. Set up process manager (PM2)

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 11. Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL format
   - Check database server is running
   - Ensure credentials are correct

2. **Email Not Sending**
   - Verify Gmail app password is correct
   - Check 2FA is enabled on Gmail account
   - Ensure less secure app access if needed

3. **Razorpay Integration Issues**
   - Verify API keys are correct
   - Check if using test/live mode consistently
   - Ensure webhook endpoints are configured

4. **Application Won't Start**
   - Check all environment variables are set
   - Verify Node.js version (18+)
   - Run `npm install` to ensure dependencies

### Logs and Debugging
- Check browser console for frontend errors
- Monitor server logs for backend issues
- Use `npm run db:push` to sync database schema

## 12. Support and Maintenance

### Regular Maintenance
- Monitor database performance
- Update dependencies regularly
- Backup database periodically
- Review and rotate API keys

### Scaling Considerations
- Database indexing for large datasets
- Implement caching for frequently accessed data
- Consider CDN for static assets
- Monitor server resources and scale as needed

## 13. Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, unique passwords
   - Rotate API keys regularly

2. **Database Security**
   - Use connection pooling
   - Implement proper user permissions
   - Regular security updates

3. **Application Security**
   - Validate all user inputs
   - Implement rate limiting
   - Use HTTPS in production
   - Regular security audits

---

## Quick Start Summary

1. Install Node.js and PostgreSQL
2. Clone project and run `npm install`
3. Set up environment variables in `.env`
4. Run `npm run db:push` to initialize database
5. Add sample data (categories, products, admin user)
6. Start application with `npm run dev`
7. Access at http://localhost:5000
8. Login with admin@rentpro.com / admin123

For additional support or questions, refer to the project documentation or contact the development team.