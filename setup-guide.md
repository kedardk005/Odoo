# 🚀 PostgreSQL Setup Guide for Rental Management System

## 📥 Step 1: Download & Install PostgreSQL

### Windows Installation:
1. **Download PostgreSQL 15+**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the installer (postgresql-15.x-x-windows-x64.exe)

2. **Run the Installer**
   - Double-click the installer
   - Follow the installation wizard
   - **IMPORTANT**: Remember the password you set for the 'postgres' user
   - Default port: 5432 (keep as is)
   - Install additional components: pgAdmin 4, Stack Builder

3. **Post-Installation**
   - PostgreSQL service should start automatically
   - pgAdmin 4 will be available in your Start Menu

### macOS Installation:
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Linux Installation:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 🔧 Step 2: Initial PostgreSQL Configuration

### Create Database User (Optional but Recommended):
1. Open pgAdmin 4 or use terminal
2. Connect to PostgreSQL with the 'postgres' user
3. Create a dedicated user for the rental system:

```sql
-- Connect as postgres user
CREATE USER rental_admin WITH PASSWORD 'rental_secure_password_2024';
ALTER USER rental_admin CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE postgres TO rental_admin;
```

### Create the Database:
```sql
-- Create the main database
CREATE DATABASE rental_management;

-- Grant permissions to rental_admin
GRANT ALL PRIVILEGES ON DATABASE rental_management TO rental_admin;
```

## 🗄️ Step 3: Database Schema Implementation

The system will automatically create all tables when you run the migration.
Your custom schema includes:

### Core Tables:
- ✅ **roles** - User role management
- ✅ **users** - Customer, staff, admin users
- ✅ **product_categories** - Product categorization
- ✅ **products** - Rentable items
- ✅ **product_units** - Time units (hour, day, week, etc.)
- ✅ **product_inventory** - Stock management
- ✅ **pricelists** - Pricing strategies
- ✅ **pricing_rules** - Product pricing rules
- ✅ **rental_quotations** - Customer quotes
- ✅ **rental_orders** - Confirmed rentals
- ✅ **rental_order_items** - Order line items
- ✅ **pickups** - Pickup scheduling
- ✅ **returns** - Return management
- ✅ **invoices** - Billing
- ✅ **payments** - Payment tracking
- ✅ **notifications** - Alert system
- ✅ **audit_logs** - Activity tracking

## ⚙️ Step 4: Environment Configuration

Update your `.env` file with PostgreSQL credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=rental_admin        # or 'postgres' if using default user
DB_PASSWORD=rental_secure_password_2024  # Your PostgreSQL password
DB_NAME=rental_management

# Alternative: Use connection string
DATABASE_URL=postgresql://rental_admin:rental_secure_password_2024@localhost:5432/rental_management
```

## 🚀 Step 5: Initialize the Database

Run these commands in your project directory:

```bash
# Install dependencies
npm install

# Run database migration (creates all tables)
npm run migrate

# Seed with sample data
npm run seed

# Start the application
npm run dev
```

## ✅ Step 6: Verify Installation

1. **Check Database Connection:**
   ```bash
   npm test
   ```

2. **Access pgAdmin 4:**
   - Open pgAdmin 4 from Start Menu
   - Connect to server (localhost:5432)
   - Navigate to: Servers → PostgreSQL 15 → Databases → rental_management
   - You should see all tables under Schemas → public → Tables

3. **Test API Endpoints:**
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   
   # Login with admin user
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@rental.com","password":"Admin123!"}'
   ```

## 🔍 Troubleshooting

### Common Issues:

1. **Connection Refused Error:**
   - Ensure PostgreSQL service is running
   - Check if port 5432 is accessible
   - Verify username/password in .env file

2. **Authentication Failed:**
   - Double-check password in .env file
   - Ensure user has correct permissions

3. **Database Does Not Exist:**
   - Create database manually in pgAdmin
   - Or run: `createdb rental_management`

4. **Port Already in Use:**
   - Change PORT in .env file (e.g., PORT=3001)
   - Or stop other services using port 3000

### PostgreSQL Commands Reference:

```bash
# Check PostgreSQL status (Windows)
sc query postgresql-x64-15

# Start PostgreSQL service (Windows)
net start postgresql-x64-15

# Stop PostgreSQL service (Windows)
net stop postgresql-x64-15

# Access PostgreSQL command line
psql -U postgres -d rental_management

# List databases
\l

# List tables in current database
\dt

# Exit psql
\q
```

## 🎯 Next Steps

Once PostgreSQL is set up and running:

1. ✅ Database server is running
2. ✅ Database and user are created
3. ✅ Environment variables are configured
4. ✅ Tables are migrated successfully
5. ✅ Sample data is seeded
6. ✅ API is responding correctly

You're ready to start frontend development! 🚀

## 📞 Need Help?

If you encounter any issues:
- Check PostgreSQL logs: `C:\Program Files\PostgreSQL\15\data\log\`
- Verify service status in Windows Services
- Ensure firewall isn't blocking port 5432
- Test connection with pgAdmin first

Your rental management system database is now ready for production use!