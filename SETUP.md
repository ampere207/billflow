# BillFlow Setup Guide

## Quick Start Commands

Follow these steps in order:

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
DATABASE_URL=your_supabase_database_url
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Run the SQL script to create all tables

### 4. Seed the Database

```bash
npm run seed
```

This will create demo data including:
- Companies: Acme Corp, TechStart Inc
- Users: john@acme.com, jane@acme.com, bob@techstart.com
- Plans, subscriptions, invoices, usage records, and API keys

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 6. Sign In

Use these demo credentials:
- Email: `john@acme.com`
- Password: Any password (demo mode)

## Project Structure Overview

- **`/app`** - Next.js app router pages and API routes
- **`/components`** - React components (UI and dashboard)
- **`/lib`** - Utility functions and Supabase clients
- **`/scripts`** - Database seed script
- **`/supabase`** - Database schema SQL
- **`/types`** - TypeScript type definitions

## Key Features Implemented

✅ Authentication with NextAuth  
✅ Dashboard with overview stats  
✅ Subscription management  
✅ Invoice generation and viewing  
✅ Usage tracking  
✅ API key management  
✅ Billing settings  
✅ Webhook logging  
✅ Modern, responsive UI  

## API Endpoints

- `GET /api/generate-invoice` - Generate invoice for active subscription
- `GET /api/record-usage` - Record demo usage data
- `POST /api/pay-invoice` - Process payment (demo mode)

## Troubleshooting

**Issue**: "Unauthorized" errors
- Check that your environment variables are set correctly
- Ensure you've run the seed script

**Issue**: Database connection errors
- Verify your Supabase URL and keys
- Make sure you've run the schema.sql script

**Issue**: Authentication not working
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your dev server URL

## Next Steps

1. Customize the UI colors and branding
2. Add more demo data if needed
3. Test all features in the dashboard
4. Review the code structure

Happy coding! 🚀

