# PostgreSQL Setup Guide for Rental Management System

## 1. Install PostgreSQL

### Method 1: Official Installer (Recommended)
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Choose version 15 or 16 (latest stable)
3. Run the installer and follow these steps:
   - **Installation Directory**: `C:\Program Files\PostgreSQL\15`
   - **Data Directory**: `C:\Program Files\PostgreSQL\15\data`
   - **Password**: Set a strong password for the `postgres` superuser (remember this!)
   - **Port**: Keep default `5432`
   - **Locale**: Use default
   - **Components**: Install all components including pgAdmin 4

### Method 2: Using Chocolatey (Alternative)
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install PostgreSQL
choco install postgresql
```

## 2. Verify Installation

Open Command Prompt or PowerShell as Administrator:

```powershell
# Check if PostgreSQL is installed
psql --version

# Check if PostgreSQL service is running
Get-Service postgresql*
```

## 3. Add PostgreSQL to PATH (if needed)

If `psql` command is not found, add PostgreSQL to your system PATH:
1. Open System Properties → Environment Variables
2. Add to System PATH: `C:\Program Files\PostgreSQL\15\bin`
3. Restart Command Prompt/PowerShell

## 4. Connect to PostgreSQL

```powershell
# Connect as postgres superuser
psql -U postgres -h localhost

# You'll be prompted for the password you set during installation
```

## 5. Create Database and User

```sql
-- Create the database
CREATE DATABASE rental_management;

-- Create a dedicated user (optional but recommended)
CREATE USER rental_user WITH PASSWORD 'rental_password_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rental_management TO rental_user;

-- Connect to the new database
\c rental_management;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO rental_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rental_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rental_user;

-- Exit PostgreSQL
\q
```

## 6. Test Connection

```powershell
# Test connection with new database
psql -U rental_user -h localhost -d rental_management

# Or with postgres user
psql -U postgres -h localhost -d rental_management
```

## 7. Configure pgAdmin (GUI Tool)

1. Open pgAdmin 4 from Start Menu
2. Create new server connection:
   - **Name**: Local PostgreSQL
   - **Host**: localhost
   - **Port**: 5432
   - **Username**: postgres (or rental_user)
   - **Password**: (your password)

## 8. Update Environment Variables

Update your `.env` file with the correct database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=rental_user
DB_PASSWORD=rental_password_2024
DB_NAME=rental_management
```

## Troubleshooting

### PostgreSQL Service Not Starting
```powershell
# Start PostgreSQL service
net start postgresql-x64-15

# Or using services.msc
# Open Services → Find PostgreSQL → Right-click → Start
```

### Connection Issues
1. Check if PostgreSQL service is running
2. Verify port 5432 is not blocked by firewall
3. Check pg_hba.conf for authentication settings
4. Ensure password is correct

### Permission Issues
```sql
-- If you get permission errors, run these as postgres superuser:
ALTER USER rental_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE rental_management TO rental_user;
```

## Next Steps

After PostgreSQL is set up:
1. Update your `.env` file with correct credentials
2. Run `npm run migrate` to create database schema
3. Run `npm run seed` to populate initial data
4. Start your application with `npm run dev`

## Useful Commands

```powershell
# Connect to database
psql -U rental_user -d rental_management

# List databases
psql -U postgres -l

# Backup database
pg_dump -U rental_user -h localhost rental_management > backup.sql

# Restore database
psql -U rental_user -h localhost rental_management < backup.sql

# Check PostgreSQL status
pg_ctl status -D "C:\Program Files\PostgreSQL\15\data"
```

## Security Notes

1. Never use default passwords in production
2. Consider using connection pooling
3. Regularly backup your database
4. Keep PostgreSQL updated
5. Use SSL connections in production

---
Now proceed with updating the database models to match your schema!