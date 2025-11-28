import { createAdminClient } from '../lib/supabase/admin'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Error: ${envVar} is not set in .env.local`)
    console.error('Please make sure you have created .env.local with your Supabase credentials.')
    process.exit(1)
  }
}

const supabase = createAdminClient()

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // 1. Create Companies
    console.log('Creating companies...')
    const { data: company1, error: company1Error } = await supabase
      .from('companies')
      .insert({
        name: 'Acme Corp',
        slug: 'acme-corp',
      })
      .select()
      .single()

    if (company1Error) throw company1Error

    const { data: company2, error: company2Error } = await supabase
      .from('companies')
      .insert({
        name: 'TechStart Inc',
        slug: 'techstart-inc',
      })
      .select()
      .single()

    if (company2Error) throw company2Error

    console.log('✅ Companies created')

    // 2. Create Users
    console.log('Creating users...')
    const { data: user1, error: user1Error } = await supabase
      .from('users')
      .insert({
        company_id: company1.id,
        email: 'john@acme.com',
        name: 'John Doe',
        role: 'owner',
      })
      .select()
      .single()

    if (user1Error) throw user1Error

    const { data: user2, error: user2Error } = await supabase
      .from('users')
      .insert({
        company_id: company1.id,
        email: 'jane@acme.com',
        name: 'Jane Smith',
        role: 'admin',
      })
      .select()
      .single()

    if (user2Error) throw user2Error

    const { data: user3, error: user3Error } = await supabase
      .from('users')
      .insert({
        company_id: company2.id,
        email: 'bob@techstart.com',
        name: 'Bob Johnson',
        role: 'owner',
      })
      .select()
      .single()

    if (user3Error) throw user3Error

    console.log('✅ Users created')

    // 3. Create Billing Settings
    console.log('Creating billing settings...')
    await supabase.from('billing_settings').insert([
      {
        company_id: company1.id,
        tax_rate: 8.5,
        currency: 'USD',
        invoice_prefix: 'ACME',
        payment_terms_days: 30,
      },
      {
        company_id: company2.id,
        tax_rate: 10.0,
        currency: 'USD',
        invoice_prefix: 'TECH',
        payment_terms_days: 15,
      },
    ])

    console.log('✅ Billing settings created')

    // 4. Create Plans
    console.log('Creating plans...')
    const { data: plan1, error: plan1Error } = await supabase
      .from('plans')
      .insert({
        company_id: company1.id,
        name: 'Basic Plan',
        description: 'Perfect for small teams',
        price: 29.99,
        currency: 'USD',
        interval: 'month',
        features: {
          users: 5,
          storage: '10GB',
          support: 'email',
        },
        is_active: true,
      })
      .select()
      .single()

    if (plan1Error) throw plan1Error

    const { data: plan2, error: plan2Error } = await supabase
      .from('plans')
      .insert({
        company_id: company1.id,
        name: 'Pro Plan',
        description: 'For growing businesses',
        price: 99.99,
        currency: 'USD',
        interval: 'month',
        features: {
          users: 25,
          storage: '100GB',
          support: 'priority',
        },
        is_active: true,
      })
      .select()
      .single()

    if (plan2Error) throw plan2Error

    const { data: plan3, error: plan3Error } = await supabase
      .from('plans')
      .insert({
        company_id: company2.id,
        name: 'Enterprise Plan',
        description: 'For large organizations',
        price: 299.99,
        currency: 'USD',
        interval: 'month',
        features: {
          users: 'unlimited',
          storage: '1TB',
          support: '24/7',
        },
        is_active: true,
      })
      .select()
      .single()

    if (plan3Error) throw plan3Error

    console.log('✅ Plans created')

    // 5. Create Subscriptions
    console.log('Creating subscriptions...')
    const now = new Date()
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const { data: sub1, error: sub1Error } = await supabase
      .from('subscriptions')
      .insert({
        company_id: company1.id,
        plan_id: plan1.id,
        user_id: user1.id,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: nextMonth.toISOString(),
        cancel_at_period_end: false,
      })
      .select()
      .single()

    if (sub1Error) throw sub1Error

    const { data: sub2, error: sub2Error } = await supabase
      .from('subscriptions')
      .insert({
        company_id: company2.id,
        plan_id: plan3.id,
        user_id: user3.id,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: nextMonth.toISOString(),
        cancel_at_period_end: false,
      })
      .select()
      .single()

    if (sub2Error) throw sub2Error

    console.log('✅ Subscriptions created')

    // 6. Create Invoices
    console.log('Creating invoices...')
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 30)

    const { data: invoice1, error: invoice1Error } = await supabase
      .from('invoices')
      .insert({
        company_id: company1.id,
        subscription_id: sub1.id,
        invoice_number: `ACME-${Date.now().toString().slice(-6)}-${sub1.id.slice(0, 8).toUpperCase()}`,
        status: 'paid',
        subtotal: 29.99,
        tax: 2.55,
        total: 32.54,
        currency: 'USD',
        due_date: dueDate.toISOString(),
        paid_at: now.toISOString(),
      })
      .select()
      .single()

    if (invoice1Error) throw invoice1Error

    const { data: invoice2, error: invoice2Error } = await supabase
      .from('invoices')
      .insert({
        company_id: company1.id,
        subscription_id: sub1.id,
        invoice_number: `ACME-${Date.now().toString().slice(-6)}-${sub1.id.slice(0, 8).toUpperCase()}`,
        status: 'open',
        subtotal: 29.99,
        tax: 2.55,
        total: 32.54,
        currency: 'USD',
        due_date: dueDate.toISOString(),
      })
      .select()
      .single()

    if (invoice2Error) throw invoice2Error

    console.log('✅ Invoices created')

    // 7. Create Invoice Items
    console.log('Creating invoice items...')
    await supabase.from('invoice_items').insert([
      {
        invoice_id: invoice1.id,
        description: 'Basic Plan - Monthly Subscription',
        quantity: 1,
        unit_price: 29.99,
        amount: 29.99,
      },
      {
        invoice_id: invoice2.id,
        description: 'Basic Plan - Monthly Subscription',
        quantity: 1,
        unit_price: 29.99,
        amount: 29.99,
      },
    ])

    console.log('✅ Invoice items created')

    // 8. Create Payments
    console.log('Creating payments...')
    await supabase.from('payments').insert({
      invoice_id: invoice1.id,
      amount: 32.54,
      currency: 'USD',
      payment_method: 'demo_card',
      status: 'completed',
      transaction_id: `txn_${Date.now()}`,
    })

    console.log('✅ Payments created')

    // 9. Create Usage Records
    console.log('Creating usage records...')
    const usageDates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      return date
    })

    const usageRecords = usageDates.map((date) => ({
      company_id: company1.id,
      subscription_id: sub1.id,
      metric_name: 'api_calls',
      quantity: Math.floor(Math.random() * 10000) + 1000,
      recorded_at: date.toISOString(),
    }))

    await supabase.from('usage_records').insert(usageRecords)

    console.log('✅ Usage records created')

    // 10. Create API Keys
    console.log('Creating API keys...')
    const apiKey1 = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    const apiKey2 = `sk_test_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

    // In production, hash the keys properly
    await supabase.from('api_keys').insert([
      {
        company_id: company1.id,
        name: 'Production Key',
        key_hash: apiKey1, // In production, use proper hashing
        key_prefix: apiKey1.substring(0, 12),
        is_active: true,
      },
      {
        company_id: company1.id,
        name: 'Test Key',
        key_hash: apiKey2, // In production, use proper hashing
        key_prefix: apiKey2.substring(0, 12),
        is_active: true,
      },
    ])

    console.log('✅ API keys created')
    console.log('\n📝 Demo API Keys (for reference):')
    console.log(`Production: ${apiKey1}`)
    console.log(`Test: ${apiKey2}`)

    console.log('\n✅ Database seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Companies: 2`)
    console.log(`- Users: 3`)
    console.log(`- Plans: 3`)
    console.log(`- Subscriptions: 2`)
    console.log(`- Invoices: 2`)
    console.log(`- Usage Records: 30`)
    console.log(`- API Keys: 2`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()

