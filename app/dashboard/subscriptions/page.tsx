import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, DollarSign, MoreVertical, ArrowRight } from "lucide-react"

export default async function SubscriptionsPage() {
  const session = await getSession()
  const supabase = await createClient()

  if (!session?.user) {
    return null
  }

  const companyId = (session.user as any).companyId

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  if (error) {
    return <div>Error loading subscriptions</div>
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "canceled":
        return "destructive"
      case "past_due":
        return "warning"
      case "trialing":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusGradient = (status: string) => {
    switch (status) {
      case "active":
        return "from-green-500 to-emerald-500"
      case "canceled":
        return "from-red-500 to-rose-500"
      case "past_due":
        return "from-orange-500 to-amber-500"
      case "trialing":
        return "from-blue-500 to-cyan-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Subscriptions</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your subscription plans and billing cycles
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          New Subscription
        </Button>
      </div>

      <div className="grid gap-6">
        {subscriptions && subscriptions.length > 0 ? (
          subscriptions.map((subscription, index) => {
            const plan = subscription.plans as any
            const statusGradient = getStatusGradient(subscription.status)
            return (
              <Card
                key={subscription.id}
                className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${statusGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${statusGradient} text-white shadow-lg`}>
                          <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{plan?.name || "Unknown Plan"}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {plan?.description || "No description"}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusVariant(subscription.status)} className="text-sm px-3 py-1">
                        {subscription.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Price</p>
                      </div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          Number(plan?.price || 0),
                          plan?.currency || "USD"
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        per {plan?.interval || "month"}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Current Period
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatDate(subscription.current_period_start)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        to {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-3">Actions</p>
                        <div className="flex flex-col gap-2">
                          {subscription.status === "active" && (
                            <Button variant="outline" size="sm" className="w-full">
                              Cancel Subscription
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-sm">
                Get started by creating your first subscription plan
              </p>
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Subscription
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
