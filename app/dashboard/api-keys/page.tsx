import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Plus, Copy } from "lucide-react"

export default async function ApiKeysPage() {
  const session = await getSession()
  const supabase = await createClient()

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for integration
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      <div className="grid gap-4">
        {apiKeys && apiKeys.length > 0 ? (
          apiKeys.map((key) => (
            <Card key={key.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{key.name}</CardTitle>
                    <CardDescription>
                      Created {formatDate(key.created_at)}
                      {key.last_used_at && (
                        <> • Last used {formatDate(key.last_used_at)}</>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={key.is_active ? "success" : "destructive"}>
                    {key.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 text-sm">
                      {key.key_prefix}...
                    </code>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No API keys found</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First API Key
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

