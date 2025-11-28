import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { SubscriptionsClient } from "./subscriptions-client"

export default async function SubscriptionsPage() {
  const session = await getSession()
  const supabase = await createClient()

  if (!session?.user) {
    return null
  }

  const companyId = (session.user as any).companyId

  // Fetch subscriptions with related data
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      plans(*),
      users(id, name, email)
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  if (error) {
    return <div>Error loading subscriptions</div>
  }

  // Fetch invoices for all subscriptions
  const subscriptionIds = subscriptions?.map((s) => s.id) || []
  const { data: invoices } = subscriptionIds.length > 0
    ? await supabase
        .from("invoices")
        .select("*, payments(*)")
        .in("subscription_id", subscriptionIds)
        .order("created_at", { ascending: false })
    : { data: [] }

  // Fetch usage records for all subscriptions
  const { data: usageRecords } = subscriptionIds.length > 0
    ? await supabase
        .from("usage_records")
        .select("*")
        .in("subscription_id", subscriptionIds)
        .order("recorded_at", { ascending: false })
        .limit(100)
    : { data: [] }

  // Group invoices and usage by subscription_id
  const invoicesBySubscription = (invoices || []).reduce((acc, invoice) => {
    if (invoice.subscription_id) {
      if (!acc[invoice.subscription_id]) {
        acc[invoice.subscription_id] = []
      }
      acc[invoice.subscription_id].push(invoice)
    }
    return acc
  }, {} as Record<string, typeof invoices>)

  const usageBySubscription = (usageRecords || []).reduce((acc, record) => {
    if (!acc[record.subscription_id]) {
      acc[record.subscription_id] = []
    }
    acc[record.subscription_id].push(record)
    return acc
  }, {} as Record<string, typeof usageRecords>)

  // Enrich subscriptions with related data
  const enrichedSubscriptions = (subscriptions || []).map((sub) => ({
    ...sub,
    invoices: invoicesBySubscription[sub.id] || [],
    usageRecords: usageBySubscription[sub.id] || [],
  }))

  return (
    <SubscriptionsClient subscriptions={enrichedSubscriptions} />
  )
}
