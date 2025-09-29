<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PhotoLens - Photography Business Management System

A comprehensive photography business management SaaS application with Supabase backend integration.

![Loading Screen](https://github.com/user-attachments/assets/f89f044c-693d-4903-b038-53a88e552f74)

## 🚀 Features

- **Client Management**: Complete client profiles with booking history and financial tracking
- **Booking System**: Session scheduling with photographer assignment and status tracking
- **Invoice Management**: Automated invoice generation with payment tracking
- **Expense Tracking**: Business expense management with categorization
- **Staff Management**: Multi-role staff system with permission controls
- **Real-time Database**: Powered by Supabase with PostgreSQL backend
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## 🏗️ Architecture

### Frontend
- **React 19** with TypeScript for type-safe development
- **Tailwind CSS** for modern, responsive styling
- **Vite** for fast development and optimized builds
- **Recharts** for data visualization

### Backend
- **Supabase** for database, authentication, and real-time features
- **PostgreSQL** database with automated triggers and constraints
- **Row Level Security (RLS)** for data protection
- **RESTful APIs** with automatic CRUD operations

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Supabase Account** (free tier available)
- **Git** for version control

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd photolens
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and anon key
3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `database/schema.sql`
4. Run the SQL script to create all tables and relationships

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following core tables:

- **staff_members**: User accounts with role-based permissions
- **clients**: Customer information and financial tracking
- **session_categories**: Photography session types (Wedding, Portrait, etc.)
- **session_packages**: Pricing packages for different session types
- **bookings**: Session bookings with photographer assignments
- **invoices**: Billing and payment tracking
- **expenses**: Business expense management
- **payment_accounts**: Financial account management

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Data Management

The application uses a centralized data manager (`services/dataManager.ts`) that:
- Handles all database operations through Supabase
- Provides caching for improved performance
- Manages loading states and error handling
- Automatically syncs data between components

### Core Services

- **`services/supabase.ts`**: Database configuration and connection
- **`services/dataService.ts`**: CRUD operations for core entities
- **`services/bookingsService.ts`**: Specialized booking and invoice services
- **`services/dataManager.ts`**: Centralized data management with caching
- **`services/seedData.ts`**: Initial data seeding for new installations

## 🎯 Current Status

### ✅ Completed Features

- Complete Supabase backend integration
- Database schema with relationships and constraints
- Data services for all core entities (clients, staff, bookings, expenses)
- Real-time data synchronization
- Loading states and error handling
- Automatic database seeding with sample data
- Environment configuration
- Production-ready build system

### 🚧 In Progress

- Invoice and payment processing integration
- Photo editing workflow backend
- Authentication system
- File upload and storage
- Advanced reporting features

## 🛡️ Security

- Row Level Security (RLS) enabled on all tables
- Environment-based configuration
- Secure API key management
- Role-based access control

## 📱 UI/UX

- Clean, modern interface with dark theme
- Responsive design for all screen sizes
- Loading states and user feedback
- Professional photography business workflow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please open an issue on GitHub or contact the development team.

---

**PhotoLens** - Streamlining photography business management with modern technology.
