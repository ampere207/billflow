import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Plus, Activity, TrendingUp, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function UsagePage() {
  const session = await getSession()
  const supabase = (await createClient()) as any

  if (!session?.user) {
    return null
  }

  const companyId = (session.user as any).companyId

  // Get subscriptions for this company
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("id, plans(name)")
    .eq("company_id", companyId)
    .eq("status", "active")

  // Get usage records grouped by metric
  const { data: usageRecords, error } = await supabase
    .from("usage_records")
    .select("*, subscriptions(plans(name))")
    .eq("company_id", companyId)
    .order("recorded_at", { ascending: false })
    .limit(50)

  if (error) {
    return <div>Error loading usage records</div>
  }

  // Group usage by metric name
  const usageByMetric = usageRecords?.reduce((acc: any, record: any) => {
    const metric = record.metric_name
    if (!acc[metric]) {
      acc[metric] = []
    }
    acc[metric].push(record)
    return acc
  }, {} as Record<string, typeof usageRecords>)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Usage Records</h1>
          <p className="mt-2 text-muted-foreground">
            Track and monitor your usage metrics in real-time
          </p>
        </div>
        <Link href="/api/record-usage">
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            Record Usage
          </Button>
        </Link>
      </div>

      {usageByMetric && Object.keys(usageByMetric).length > 0 ? (
        <div className="grid gap-6">
          {Object.entries(usageByMetric).map(([metricName, records]: [string, any], index: number) => {
            const total = records.reduce(
              (sum: number, r: any) => sum + Number(r.quantity),
              0
            )
            const avg = total / records.length
            const max = Math.max(...records.map((r: any) => Number(r.quantity)))
            const min = Math.min(...records.map((r: any) => Number(r.quantity)))

            return (
              <Card
                key={metricName}
                className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                        <Activity className="h-7 w-7" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl capitalize">
                          {metricName.replace(/_/g, " ")}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {records.length} records tracked
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Total</p>
                      </div>
                      <p className="text-2xl font-bold">{total.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Average</p>
                      </div>
                      <p className="text-2xl font-bold">{Math.round(avg).toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Maximum</p>
                      <p className="text-2xl font-bold">{max.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Minimum</p>
                      <p className="text-2xl font-bold">{min.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground">Recent Records</p>
                    {records.slice(0, 10).map((record: any) => {
                      const subscription = record.subscriptions as any
                      const plan = subscription?.plans as any
                      return (
                        <div
                          key={record.id}
                          className="group/item flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50 hover:shadow-md"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-lg font-bold">
                                {record.quantity.toLocaleString()}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {plan?.name || "Unknown Plan"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(record.recorded_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    {records.length > 10 && (
                      <div className="rounded-lg border border-dashed p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          +{records.length - 10} more records
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No usage records found</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Start tracking your usage metrics by recording your first usage event
            </p>
            <Link href="/api/record-usage">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Record Your First Usage
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
