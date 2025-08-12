# 🏠 Complete Rental Management System

A comprehensive web-based rental management system built with modern technologies. This application streamlines the entire rental process from browsing products to scheduling pickups, managing quotations, and processing payments.

## ✨ Features

### 🎯 Core Rental Features
- **Product Management**: Complete inventory management with categories, pricing, and availability tracking
- **Rental Quotations & Orders**: Create quotations, convert to orders, and manage the entire rental lifecycle
- **Flexible Pricing**: Hourly, daily, weekly, and monthly rental rates with custom pricing rules
- **Delivery Management**: Schedule pickups and returns with automated reminders
- **Payment Processing**: Integrated Razorpay payment gateway with flexible invoicing
- **Calendar Scheduling**: Visual calendar for managing rentals and availability

### 📊 Business Intelligence
- **Advanced Reports**: Revenue, top products, customer analytics with PDF/CSV export
- **Real-time Dashboard**: Live metrics, rental analytics, and system monitoring
- **Automated Notifications**: Email reminders for returns, overdue alerts, and late fee calculations

### 🔧 System Features
- **File Upload**: Cloudinary integration for product images and documents
- **Automated Services**: Cron jobs for reminders, overdue processing, and late fee calculations
- **Multi-role Access**: Separate admin and customer portals
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library
- **React Query** for state management
- **React Big Calendar** for scheduling
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **Node-cron** for scheduled tasks
- **Nodemailer** for email services

### Services & Integrations
- **Razorpay** for payments
- **Cloudinary** for file storage
- **Gmail SMTP** for email notifications
- **JWT** for authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd OdooFrontend
npm install
```

### 2. Environment Setup
The `.env` file is already configured with your credentials:

```bash
# Database Configuration for Odoo Server
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=6969Ma@18082004
DB_NAME=LocalPostgreSQL

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email Configuration
MAIL_USER=skillmart.ce@gmail.com
MAIL_PASS=keph uzrw ogtf wqvr

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_4QjuyHe6sBhG9a
RAZORPAY_KEY_SECRET=u0rEEwLxXKWhrbvJS3gjZotp

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=ddljrgyvx
CLOUDINARY_API_KEY=833784628377365
CLOUDINARY_API_SECRET=ZTPwDOHRJPOBFZU-lmqO-DFAS2k
```

### 3. Database Setup
```bash
# Setup database and start development server
npm run setup:dev

# Or setup database only
npm run setup:db
```

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📱 Application Structure

### Admin Features (`/admin`)
- **Enhanced Dashboard** (`/admin/enhanced-dashboard`): Complete business overview
- **Product Management** (`/admin/enhanced-products`): Advanced inventory management
- **Orders Management**: Track and manage rental orders
- **Customer Management**: Customer database and analytics
- **Reports**: Comprehensive business intelligence
- **System Settings**: Automated services and configuration

### Customer Features (`/customer`)
- **Product Browsing**: Browse available products by category
- **Product Details**: View detailed product information and check availability
- **Cart Management**: Add products and manage rental periods
- **Quotation Requests**: Request quotes for custom rentals
- **Checkout**: Secure payment processing
- **Order History**: Track rental history and current orders

## 🔧 Configuration

### Email Notifications
The system sends automated emails for:
- Order confirmations with PDF invoices
- Quotation requests
- Return reminders (2 days before due)
- Overdue notifications with late fees
- Payment confirmations

### Automated Services
Cron jobs run automatically for:
- **Return Reminders**: Daily at 9:00 AM
- **Overdue Processing**: Daily at 10:00 AM  
- **Late Fee Calculation**: Every hour

### Payment Gateway
Razorpay integration supports:
- Credit/Debit cards
- Net banking
- UPI payments
- Wallets

### File Storage
Cloudinary handles:
- Product images with optimization
- Document storage
- Automatic image resizing and compression

## 📊 Business Logic

### Rental Process Flow
1. **Browse & Select**: Customer browses products and checks availability
2. **Quotation** (Optional): Request quotes for custom requirements
3. **Order Creation**: Convert quotation to order or create direct order
4. **Payment**: Secure online payment processing
5. **Delivery Scheduling**: Schedule pickup and return dates
6. **Monitoring**: Track rental status and send automated reminders
7. **Return Processing**: Handle returns and calculate any late fees

### Pricing Rules
- **Base Rates**: Hourly, daily, weekly, monthly rates per product
- **Customer Segments**: Special pricing for VIP/corporate customers
- **Seasonal Pricing**: Date-based pricing rules
- **Bulk Discounts**: Quantity-based discounts
- **Late Fees**: Configurable late fee percentages and caps

### Inventory Management
- **Real-time Availability**: Track available vs reserved quantities
- **Product Reservations**: Prevent double-booking
- **Status Management**: Active, inactive, maintenance states
- **Category Organization**: Hierarchical product categorization

## 🎨 UI/UX Features

### Modern Design
- Clean, responsive interface built with Tailwind CSS
- Dark/light mode support
- Mobile-first responsive design
- Accessible components with proper ARIA labels

### Enhanced User Experience
- **Real-time Search**: Instant product filtering
- **Availability Calendar**: Visual rental calendar
- **Progress Indicators**: Clear checkout and order progress
- **Notifications**: Toast notifications for user feedback
- **File Upload**: Drag-and-drop file uploads with progress

## 📈 Reports & Analytics

### Available Reports
- **Revenue Reports**: Period-based revenue analysis
- **Product Analytics**: Most rented products, revenue by product
- **Customer Analytics**: Top customers, customer segmentation
- **Rental Analytics**: Utilization rates, peak periods

### Export Options
- **PDF Reports**: Professional formatted reports
- **CSV Exports**: Data exports for further analysis
- **Real-time Dashboards**: Live business metrics

## 🔐 Security & Authentication

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt password encryption
- **HTTPS Support**: SSL/TLS encryption ready
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **File Upload Security**: Type and size validation

### Role-based Access
- **Admin Users**: Full system access and management
- **Customers**: Limited to their own data and public features
- **API Security**: Protected endpoints with proper authorization

## 🌐 API Endpoints

### Core Endpoints
- `GET/POST /api/products` - Product management
- `GET/POST /api/orders` - Order management
- `GET/POST /api/quotations` - Quotation handling
- `POST /api/payments` - Payment processing
- `GET /api/reports/*` - Business reports

### File & System
- `POST /api/upload/*` - File upload endpoints
- `POST /api/admin/cron/*` - System management
- `GET /api/products/:id/availability` - Availability checking

## 🚨 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check PostgreSQL service
pg_isready -h localhost -p 5432

# Verify database exists
psql -h localhost -U postgres -l
```

**Email Not Sending**
- Verify Gmail app password is correct
- Check spam folder for test emails
- Ensure 2FA is enabled on Gmail account

**Payment Gateway Issues**
- Verify Razorpay test keys are active
- Check network connectivity
- Review Razorpay dashboard for transaction logs

**File Upload Problems**
- Verify Cloudinary credentials
- Check file size limits (10MB default)
- Ensure proper CORS configuration

## 🔄 Development Workflow

### Code Structure
```
├── client/src/          # Frontend React application
├── server/              # Backend Express server
├── shared/              # Shared types and schemas
├── scripts/             # Database and utility scripts
└── docs/                # Documentation
```

### Development Commands
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run setup:db        # Initialize database
npm run check           # Type checking
npm test                # Run tests
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Support

For support or questions:
- Email: skillmart.ce@gmail.com
- Create an issue in the repository
- Check the documentation in `/docs` folder

---

**Built with ❤️ for efficient rental business management**