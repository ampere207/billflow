"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Plus, Copy } from "lucide-react"
import { CreateApiKeyDialog } from "@/components/dashboard/create-api-key-dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function ApiKeysClient({ apiKeys }: { apiKeys: any[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleRevoke = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/api-keys/${keyId}/revoke`, {
        method: "PATCH",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to revoke API key")
      }

      toast({
        variant: "success",
        title: "Success",
        description: "API key revoked successfully",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to revoke API key",
      })
    }
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">API Keys</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your API keys for integration
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </div>

        <div className="grid gap-6">
          {apiKeys && apiKeys.length > 0 ? (
            apiKeys.map((key: any, index: number) => (
              <Card
                key={key.id}
                className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{key.name}</CardTitle>
                      <CardDescription>
                        Created {formatDate(key.created_at)}
                        {key.last_used_at && (
                          <> • Last used {formatDate(key.last_used_at)}</>
                        )}
                        {key.expires_at && (
                          <> • Expires {formatDate(key.expires_at)}</>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={key.is_active ? "success" : "destructive"} className="text-sm px-3 py-1">
                      {key.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <code className="rounded-lg bg-muted px-3 py-2 text-sm font-mono">
                        {key.key_prefix}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(key.key_prefix)
                          toast({
                            variant: "success",
                            title: "Copied",
                            description: "Key prefix copied to clipboard",
                          })
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {key.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevoke(key.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No API keys found</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-sm">
                  Create an API key to start integrating with your applications
                </p>
                <Button
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First API Key
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <CreateApiKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}

