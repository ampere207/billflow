import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { PlansClient } from "./plans-client"

export default async function PlansPage() {
  const session = await getSession()
  const supabase = await createClient()

  if (!session?.user) {
    return null
  }

  const companyId = (session.user as any).companyId

  const { data: plans, error } = await supabase
    .from("plans")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  if (error) {
    return <div>Error loading plans</div>
  }

  return <PlansClient plans={plans || []} />
}

