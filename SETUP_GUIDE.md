# 🚀 Complete Setup Guide for Rental Management System

## Prerequisites Checklist
- ✅ Node.js 16+ installed
- ✅ PostgreSQL 12+ installed and running
- ✅ Git (for version control)

## 📋 Step-by-Step Setup Instructions

### **Step 1: PostgreSQL Setup**

1. **Install PostgreSQL** (if not already installed)
   - Follow instructions in `POSTGRES_SETUP.md`
   - Ensure PostgreSQL service is running

2. **Create Database and User**
   ```sql
   -- Connect as postgres superuser
   psql -U postgres

   -- Create database
   CREATE DATABASE rental_management;

   -- Create dedicated user (recommended)
   CREATE USER rental_user WITH PASSWORD 'rental_password_2024';

   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE rental_management TO rental_user;

   -- Connect to new database
   \c rental_management;

   -- Grant schema privileges
   GRANT ALL ON SCHEMA public TO rental_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rental_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rental_user;

   -- Exit
   \q
   ```

### **Step 2: Environment Configuration**

1. **Copy Environment File**
   ```powershell
   cp .env.example .env
   ```

2. **Update .env File**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=rental_user
   DB_PASSWORD=rental_password_2024
   DB_NAME=rental_management

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRES_IN=7d

   # Email Configuration (for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password

   # Payment Gateway Configuration (Optional for now)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   PAYPAL_CLIENT_ID=your_paypal_client_id
   ```

### **Step 3: Install Dependencies**

```powershell
# Install all required packages
npm install
```

### **Step 4: Database Schema Setup**

You have **2 options** for setting up the database schema:

#### **Option A: Raw SQL Schema (Recommended)**
```powershell
# Create the complete database schema using raw SQL
node src/utils/createSchema.js
```

#### **Option B: Sequelize Migration**
```powershell
# Create schema using Sequelize models
npm run migrate
```

### **Step 5: Seed Initial Data**

```powershell
# Populate database with initial data
node src/utils/seedNewSchema.js

# Or use the old seeding script (if using Option B)
npm run seed
```

### **Step 6: Start the Application**

```powershell
# Development mode with hot reload
npm run dev

# Or production mode
npm start
```

## 🔍 **Verification Steps**

### **1. Check Database Connection**
```powershell
# Test database connectivity
psql -U rental_user -d rental_management -c "SELECT COUNT(*) FROM users;"
```

### **2. Verify API Endpoints**
Open your browser or use a tool like Postman:

- **Health Check**: `GET http://localhost:3000/health`
- **API Documentation**: `GET http://localhost:3000/api-docs` (if Swagger is configured)

### **3. Test Authentication**
```json
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@rental.com",
  "password": "password"
}
```

### **4. Check Database Tables**
```sql
-- Connect to database
psql -U rental_user -d rental_management

-- List all tables
\dt

-- Check sample data
SELECT u.full_name, r.role_name FROM users u 
JOIN roles r ON u.role_id = r.role_id;

-- Check products
SELECT p.name, pc.category_name FROM products p 
LEFT JOIN product_categories pc ON p.category_id = pc.category_id;
```

## 🛠️ **Troubleshooting**

### **Common Issues & Solutions**

#### **PostgreSQL Connection Issues**
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Start PostgreSQL service if stopped
net start postgresql-x64-15

# Test connection manually
psql -U rental_user -h localhost -d rental_management
```

#### **Permission Errors**
```sql
-- Run as postgres superuser if you get permission errors
ALTER USER rental_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE rental_management TO rental_user;
GRANT ALL ON SCHEMA public TO rental_user;
```

#### **Port Already in Use**
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env file
PORT=3001
```

#### **Sequelize Sync Issues**
```powershell
# Drop and recreate schema if needed (⚠️ This will delete all data)
node src/utils/createSchema.js

# Then reseed data
node src/utils/seedNewSchema.js
```

### **Database Reset (if needed)**
```sql
-- Connect as postgres superuser
psql -U postgres

-- Drop and recreate database (⚠️ This deletes everything)
DROP DATABASE rental_management;
CREATE DATABASE rental_management;
GRANT ALL PRIVILEGES ON DATABASE rental_management TO rental_user;
```

Then re-run schema creation and seeding.

## 📊 **Database Schema Overview**

Your database now includes these tables:
- **roles** - User roles (customer, staff, admin)
- **users** - User accounts with role assignments
- **product_categories** - Product categorization
- **products** - Rentable items
- **product_units** - Rental time units (hour, day, week, etc.)
- **product_inventory** - Stock tracking
- **pricelists & pricing_rules** - Dynamic pricing system
- **rental_quotations** - Price estimates
- **rental_orders & rental_order_items** - Confirmed bookings
- **pickups & returns** - Delivery scheduling
- **invoices & payments** - Financial transactions
- **notifications** - System alerts
- **audit_logs** - Activity tracking

## 🎯 **Next Steps**

1. **Test API Endpoints** - Use the test file: `node test-api.js`
2. **Configure Email** - Set up SMTP for notifications
3. **Set Up Payment Gateways** - Configure Stripe/PayPal for payments
4. **Frontend Integration** - Connect your React/Vue frontend
5. **Production Deployment** - Deploy to cloud platforms

## 📞 **Support**

If you encounter issues:
1. Check the error logs in the console
2. Verify database connectivity
3. Ensure all environment variables are set correctly
4. Check that all dependencies are installed

**Happy coding! 🎉**