# Rental Management System Backend

A comprehensive backend system for managing rental operations, built with Node.js, Express, and PostgreSQL.

## Features

### Core Rental Features
- **Product Management**: Define rentable products with flexible pricing
- **Quotations & Orders**: Create quotes, convert to orders, track rentals
- **Delivery Management**: Schedule pickups and returns with tracking
- **Invoice & Payment**: Flexible invoicing with multiple payment methods
- **Pricelist Management**: Dynamic pricing based on customer segments and duration
- **Notifications**: Automated reminders and alerts via email/SMS

### User Roles
- **Customer**: Browse products, make reservations, manage rentals
- **Admin/Staff**: Full system management and reporting capabilities

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd rental-platform
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb rental_management
   
   # Or using psql
   psql -U postgres -c "CREATE DATABASE rental_management;"
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database and service credentials
   ```

4. **Database Migration and Seeding**
   ```bash
   npm run setup  # This runs migrate + seed
   # Or individually:
   npm run migrate
   npm run seed
   ```

5. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000`

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=rental_management

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
PAYPAL_CLIENT_ID=your_paypal_client_id
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Product Management
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)

### Rental Operations
- `POST /api/quotations` - Create quotation
- `POST /api/orders` - Create order
- `GET /api/rentals/my-rentals` - Get user rentals
- `POST /api/delivery` - Schedule delivery (Staff)

### Reporting & Analytics
- `GET /api/reports/dashboard` - Dashboard data
- `GET /api/reports/revenue/overview` - Revenue reports
- `GET /api/reports/customers/top-customers` - Customer analytics

## Project Structure

```
src/
├── app.js                 # Express application setup
├── config/
│   └── database.js        # Database configuration
├── models/                # Sequelize models
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── associations.js
├── controllers/           # Route handlers
├── routes/               # API routes
├── services/             # Business logic services
├── middleware/           # Custom middleware
├── utils/                # Utility functions
└── templates/            # Email templates
```

## Key Models

### User
- Authentication and profile management
- Role-based access control (customer/staff/admin)
- Notification preferences

### Product
- Rentable items with pricing tiers
- Inventory tracking and availability
- Category and specification management

### Order & OrderItem
- Rental bookings with date ranges
- Status tracking (confirmed → delivered → returned)
- Late fee and damage charge handling

### Quotation
- Price estimates before booking
- Conversion to orders
- Validity periods

### Delivery
- Pickup and return scheduling
- Driver assignment and tracking
- Proof of delivery management

### Invoice & Payment
- Flexible invoicing (upfront, partial, recurring)
- Multiple payment gateway support
- Late fee automation

## Business Logic

### Rental Flow
1. Customer browses products and checks availability
2. Creates quotation with desired items and dates
3. Quotation converted to order upon confirmation
4. System reserves inventory and schedules pickup
5. Items delivered to customer
6. Return scheduled and completed
7. Final invoice generated with any additional charges

### Pricing System
- Base pricing per product
- Time-based rates (hourly, daily, weekly, monthly, yearly)
- Customer segment pricing (individual, corporate, VIP)
- Seasonal and promotional pricing
- Security deposits and late fees

### Notification System
- Automated pickup reminders
- Return date alerts
- Payment due notifications
- Overdue penalties
- Customizable templates and preferences

## Payment Integration

### Supported Gateways
- **Stripe**: Credit cards and digital wallets
- **Razorpay**: UPI, cards, net banking (India)
- **PayPal**: Global payment processing
- **Manual**: Cash, bank transfer, cheque

### Features
- Secure payment processing
- Partial payments and installments
- Automatic refund handling
- Payment method analytics

## Reporting & Analytics

### Dashboard Metrics
- Revenue trends and projections
- Most rented products
- Customer acquisition and retention
- Inventory utilization rates

### Business Reports
- Financial: P&L, cash flow, outstanding payments
- Operational: Delivery performance, late returns
- Customer: Lifetime value, segmentation analysis
- Product: Utilization, profitability analysis

### Export Options
- PDF reports for sharing
- Excel exports for analysis
- CSV data exports
- Scheduled report delivery

## Security Features

- JWT-based authentication
- Role-based authorization
- Input validation and sanitization
- SQL injection prevention
- Rate limiting and CORS protection

## Deployment

### Docker Support
```dockerfile
# Dockerfile available for containerized deployment
docker build -t rental-management .
docker run -p 3000:3000 rental-management
```

### Environment Setup
- Development: Local database with hot reloading
- Production: Optimized for cloud deployment
- Database migrations for version management

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@rentalmanagement.com
- Documentation: [API Docs](http://localhost:3000/api/docs)

---

Built with ❤️ for modern rental businesses