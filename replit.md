# Overview

RentPro is a professional rental management platform designed for equipment and inventory tracking. The application provides comprehensive functionality for managing rental businesses, including product catalog management, customer management, order processing, delivery scheduling, and payment tracking with Razorpay integration. It features a modern React frontend with a comprehensive UI component library and an Express.js backend with PostgreSQL database integration.

## Recent Changes
**Latest Update**: January 11, 2025
- ✅ Integrated Razorpay payment gateway with user's API credentials  
- ✅ Created secure payment verification system with signature validation
- ✅ Built complete checkout page with comprehensive order summary
- ✅ Fixed frontend component errors that were causing application crashes
- ✅ Added payment flow integration from booking modal to checkout
- ✅ Created comprehensive UI components: NavigationHeader, ProductGrid, OrderStatus, MetricsCards, RecentOrders, DeliveryScheduler
- ✅ Built complete CRUD pages for Products, Orders, Customers with advanced filtering and search
- ✅ Implemented responsive design with Tailwind CSS and shadcn/ui components

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client application is built using React with TypeScript and follows a component-based architecture. The UI is constructed using Radix UI primitives with shadcn/ui components and styled with Tailwind CSS. The application uses Wouter for client-side routing and TanStack Query for server state management and caching.

**Key Design Decisions:**
- **Component Library**: Uses shadcn/ui components built on top of Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with custom CSS variables for theming and design tokens
- **State Management**: TanStack Query for server state, local component state for UI interactions
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
The server follows a REST API architecture built with Express.js and TypeScript. The application uses a modular structure with separate concerns for routing, storage, and server configuration.

**Key Design Decisions:**
- **API Design**: RESTful endpoints with consistent JSON responses
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling with structured error responses
- **Development Setup**: Vite integration for development with hot module replacement

## Database Schema
The application uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema supports a comprehensive rental management system with the following core entities:

**Core Tables:**
- **Users**: Customer and staff management with role-based access
- **Products**: Equipment catalog with categories, pricing tiers, and availability tracking
- **Orders**: Rental orders with line items and status management
- **Deliveries**: Pickup and return scheduling with driver assignment
- **Payments**: Payment tracking with multiple status states
- **Notifications**: User notification system

**Design Patterns:**
- Enum types for consistent status values across entities
- UUID primary keys for all tables
- Timestamp tracking for audit trails
- Decimal precision for financial calculations

## Authentication & Authorization
The system implements a simple authentication mechanism with role-based access control supporting customer, staff, and admin roles. User passwords are stored directly (note: production systems should implement proper password hashing).

## Data Flow & API Structure
The application follows a layered architecture:
1. **Presentation Layer**: React components with shadcn/ui
2. **API Layer**: Express.js REST endpoints
3. **Business Logic**: Storage layer with TypeScript interfaces
4. **Data Layer**: Drizzle ORM with PostgreSQL

**API Endpoints Cover:**
- Authentication (register/login)
- Dashboard metrics and analytics
- Product and category management
- Order lifecycle management
- Customer management
- Delivery scheduling
- Payment processing
- Notification system

# External Dependencies

## Database
- **PostgreSQL**: Primary database using Neon Database serverless
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Database Configuration**: Environment-based connection via DATABASE_URL

## UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library

## State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Production bundling for server code
- **Replit Integration**: Development environment optimizations

## Third-Party Integrations
- **Razorpay**: Primary payment processing infrastructure for rental transactions, security deposits, and refunds
- **Date-fns**: Date manipulation and formatting utilities
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

## Recent Changes (August 2025)
- **Payment Integration**: Migrated from Stripe to Razorpay payment gateway
  - Implemented Razorpay order creation and payment verification APIs
  - Added secure payment component with signature verification
  - Created checkout page with comprehensive order summary
  - Integrated payment flow with existing order management system
- **Frontend Improvements**: Fixed SelectItem component issues causing runtime errors
- **API Enhancement**: Added dedicated Razorpay payment routes for order creation and verification

The application is designed to be easily deployable with environment-based configuration and includes development-specific tooling for the Replit environment.