import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { ApiKeysClient } from "./api-keys-client"

export default async function ApiKeysPage() {
  const session = await getSession()
  const supabase = (await createClient()) as any

  if (!session?.user) {
    return null
  }

  const companyId = (session.user as any).companyId

  const { data: apiKeys, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  if (error) {
    return <div>Error loading API keys</div>
  }

  return <ApiKeysClient apiKeys={apiKeys || []} />
}
