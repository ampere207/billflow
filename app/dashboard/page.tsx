import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CreditCard, FileText, TrendingUp, Users, ArrowUpRight, ArrowDownRight, MoreVertical } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const session = await getSession()
  const supabase = (await createClient()) as any

  if (!session?.user) {
    return null
  }

  const companyId = (session.user as any).companyId

  // Fetch dashboard stats
  const [subscriptionsRes, invoicesRes, usageRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*, plans(*)")
      .eq("company_id", companyId)
      .eq("status", "active"),
    supabase
      .from("invoices")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("usage_records")
      .select("quantity")
      .eq("company_id", companyId)
      .order("recorded_at", { ascending: false })
      .limit(30),
  ])

  const subscriptions = subscriptionsRes.data || []
  const invoices = invoicesRes.data || []
  const usageRecords = usageRes.data || []

  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + Number(inv.total), 0)

  const totalUsage = usageRecords.reduce(
    (sum, record) => sum + Number(record.quantity),
    0
  )

  const pendingInvoices = invoices.filter((inv) => inv.status === "open").length
  const revenueChange = 12.5 // Mock percentage

  const stats = [
    {
      title: "Active Subscriptions",
      value: subscriptions.length,
      icon: CreditCard,
      description: "Currently active",
      change: "+2 this month",
      trend: "up",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      description: "All time",
      change: `+${revenueChange}% from last month`,
      trend: "up",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices,
      icon: FileText,
      description: "Awaiting payment",
      change: pendingInvoices > 0 ? "Action required" : "All clear",
      trend: pendingInvoices > 0 ? "down" : "up",
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Total Usage",
      value: totalUsage.toLocaleString(),
      icon: Users,
      description: "Last 30 days",
      change: "+15% from last month",
      trend: "up",
      gradient: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's an overview of your billing and subscriptions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover-lift animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-orange-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-orange-500"}>
                  {stat.change}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest invoice activity</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="group flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50 hover:shadow-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{invoice.invoice_number}</p>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "success"
                              : invoice.status === "open"
                              ? "warning"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(Number(invoice.total), invoice.currency)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No invoices yet
                  </p>
                </div>
              )}
            </div>
            <Link href="/dashboard/invoices" className="mt-6 block">
              <Button variant="outline" className="w-full">
                View All Invoices
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>Your current plans</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="group flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50 hover:shadow-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {(sub.plans as any)?.name || "Unknown Plan"}
                        </p>
                        <Badge variant="success" className="text-xs">
                          {sub.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Renews {formatDate(sub.current_period_end)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(
                          Number((sub.plans as any)?.price || 0),
                          (sub.plans as any)?.currency || "USD"
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        per {(sub.plans as any)?.interval || "month"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No active subscriptions
                  </p>
                </div>
              )}
            </div>
            <Link href="/dashboard/subscriptions" className="mt-6 block">
              <Button variant="outline" className="w-full">
                Manage Subscriptions
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
