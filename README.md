# BillFlow - Subscription Billing Management System

A comprehensive SaaS subscription billing management system built with Next.js and Supabase. BillFlow provides a complete solution for managing subscriptions, invoices, usage tracking, and API integrations.

## 🚀 Features

- **Subscription Management**: Create and manage recurring subscription plans
- **Invoice Generation**: Automatically generate invoices for subscriptions
- **Usage Tracking**: Monitor and record usage metrics
- **Payment Processing**: Demo payment system (no real payment gateway)
- **API Key Management**: Generate and manage API keys for integrations
- **Billing Settings**: Configure tax rates, currencies, and payment terms
- **Webhook Logging**: Track webhook events for integrations
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and Radix UI

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **TypeScript**: Full type safety

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- npm or yarn package manager

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd billflow

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your keys
3. Go to SQL Editor and run the schema from `supabase/schema.sql`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Database
DATABASE_URL=your_supabase_database_url
```

**To generate a NEXTAUTH_SECRET**, run:
```bash
openssl rand -base64 32
```

### 4. Seed the Database

Run the seed script to populate the database with demo data:

```bash
npm run seed
```

This will create:
- 2 demo companies
- 3 users (john@acme.com, jane@acme.com, bob@techstart.com)
- 3 subscription plans
- 2 active subscriptions
- 2 invoices
- 30 usage records
- 2 API keys

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Demo Credentials

After seeding, you can sign in with:

- **Email**: `john@acme.com` (Owner)
- **Email**: `jane@acme.com` (Admin)
- **Email**: `bob@techstart.com` (Owner)
- **Password**: Any password (demo mode)

## 📁 Project Structure

```
billflow/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── generate-invoice/
│   │   ├── record-usage/
│   │   └── pay-invoice/
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   │   ├── subscriptions/
│   │   ├── invoices/
│   │   ├── usage/
│   │   ├── api-keys/
│   │   └── settings/
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── dashboard/        # Dashboard components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── auth.ts           # Auth utilities
│   └── utils.ts          # Utility functions
├── scripts/
│   └── seed.ts           # Database seed script
├── supabase/
│   └── schema.sql        # Database schema
└── types/
    └── database.types.ts # TypeScript types
```

## 🗄️ Database Schema

The system includes the following tables:

1. **companies** - Company information
2. **users** - Company members with roles
3. **plans** - Subscription plans
4. **subscriptions** - Active subscriptions
5. **invoices** - Generated invoices
6. **invoice_items** - Line items for invoices
7. **payments** - Payment records
8. **usage_records** - Usage metrics tracking
9. **api_keys** - API keys for integrations
10. **billing_settings** - Company billing configuration
11. **webhooks** - Webhook event logs

## 🔌 API Routes

### Generate Invoice
- **GET/POST** `/api/generate-invoice`
- Generates an invoice for an active subscription

### Record Usage
- **GET/POST** `/api/record-usage`
- Records usage metrics for a subscription

### Pay Invoice
- **POST** `/api/pay-invoice`
- Processes a payment for an invoice (demo mode)

## 🎨 UI Components

The project uses a custom component library built on Radix UI:

- Button, Card, Badge
- Input, Label
- Tabs, Avatar
- And more...

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with demo data

## 📝 Notes

- This is a demo project for educational purposes
- Payment processing is simulated (no real payment gateway)
- API keys are stored with basic hashing (use proper encryption in production)
- Webhooks are logged but not actually sent (for demo purposes)

## 🎯 Future Enhancements

- Real payment gateway integration
- Email notifications
- Advanced analytics and reporting
- Multi-currency support
- Subscription upgrade/downgrade flows
- Customer portal
- Export functionality (PDF, CSV)

## 📄 License

This project is created for educational purposes as part of a DBMS course project.

## 👥 Contributing

This is a course project. For questions or issues, please contact the project maintainers.

---

Built with ❤️ using Next.js and Supabase
