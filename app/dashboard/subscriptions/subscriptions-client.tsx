"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Calendar,
  DollarSign,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  User,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { CreateSubscriptionDialog } from "@/components/dashboard/create-subscription-dialog"
import { InvoicePreviewDialog } from "@/components/dashboard/invoice-preview-dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export function SubscriptionsClient({
  subscriptions,
}: {
  subscriptions: any[]
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedSubscriptions, setExpandedSubscriptions] = useState<Set<string>>(new Set())
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  const toggleExpand = (subscriptionId: string) => {
    const newExpanded = new Set(expandedSubscriptions)
    if (newExpanded.has(subscriptionId)) {
      newExpanded.delete(subscriptionId)
    } else {
      newExpanded.add(subscriptionId)
    }
    setExpandedSubscriptions(newExpanded)
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

  const handleCancel = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) {
      return
    }

    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: "PATCH",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel subscription")
      }

      toast({
        variant: "success",
        title: "Success",
        description: "Subscription canceled successfully",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to cancel subscription",
      })
    }
  }

  const calculateTotalRevenue = (invoices: any[]) => {
    return invoices
      .filter((inv: any) => inv.status === "paid")
      .reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0)
  }

  const calculateTotalUsage = (usageRecords: any[]) => {
    return usageRecords.reduce((sum: number, record: any) => sum + Number(record.quantity || 0), 0)
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Subscriptions</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your subscription plans and billing cycles
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Subscription
          </Button>
        </div>

        {/* Summary Statistics */}
        {subscriptions && subscriptions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Subscriptions</p>
                    <p className="text-3xl font-bold mt-1">{subscriptions.length}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-3xl font-bold mt-1 text-green-600">
                      {subscriptions.filter((s: any) => s.status === "active").length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold mt-1">
                      {formatCurrency(
                        subscriptions.reduce((sum: number, s: any) => {
                          const invoices = s.invoices || []
                          return sum + calculateTotalRevenue(invoices)
                        }, 0),
                        "USD"
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                    <p className="text-3xl font-bold mt-1">
                      {subscriptions
                        .reduce((sum: number, s: any) => sum + calculateTotalUsage(s.usageRecords || []), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6">
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((subscription: any, index: number) => {
              const plan = subscription.plans as any
              const user = subscription.users as any
              const statusGradient = getStatusGradient(subscription.status)
              const isExpanded = expandedSubscriptions.has(subscription.id)
              const invoices = subscription.invoices || []
              const usageRecords = subscription.usageRecords || []
              const totalRevenue = calculateTotalRevenue(invoices)
              const totalUsage = calculateTotalUsage(usageRecords)
              const daysRemaining = getDaysRemaining(subscription.current_period_end)
              const isActive = subscription.status === "active"

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
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-2xl">{plan?.name || "Unknown Plan"}</CardTitle>
                              <Badge variant={getStatusVariant(subscription.status) as any} className="text-xs">
                                {subscription.status}
                              </Badge>
                            </div>
                            <CardDescription className="text-base mt-1">
                              {plan?.description || "No description"}
                            </CardDescription>
                            {user && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{user.name || user.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-4 mb-6">
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
                            Billing Period
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatDate(subscription.current_period_start)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          to {formatDate(subscription.current_period_end)}
                        </p>
                        {isActive && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Expired"}
                          </p>
                        )}
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium text-muted-foreground">Invoices</p>
                        </div>
                        <p className="text-2xl font-bold">{invoices.length}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(totalRevenue, plan?.currency || "USD")} total
                        </p>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium text-muted-foreground">Usage</p>
                        </div>
                        <p className="text-2xl font-bold">{totalUsage.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {usageRecords.length} records
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mb-4">
                      {subscription.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(subscription.id)}
                        >
                          Cancel Subscription
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(subscription.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            View Details
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubscription(subscription)
                          setInvoicePreviewOpen(true)
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Preview Invoice
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 space-y-6 border-t pt-6">
                        {/* Subscription Info */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Subscription Information
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Subscription ID</p>
                              <p className="text-sm font-mono">{subscription.id}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Created</p>
                              <p className="text-sm">{formatDate(subscription.created_at)}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Status</p>
                              <Badge variant={getStatusVariant(subscription.status) as any}>
                                {subscription.status}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Cancel at Period End
                              </p>
                              <p className="text-sm">
                                {subscription.cancel_at_period_end ? (
                                  <span className="flex items-center gap-1 text-orange-600">
                                    <Clock className="h-4 w-4" />
                                    Yes
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    No
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Recent Invoices */}
                        {invoices.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Recent Invoices ({invoices.length})
                            </h3>
                            <div className="space-y-2">
                              {invoices.slice(0, 5).map((invoice: any) => (
                                <div
                                  key={invoice.id}
                                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">{invoice.invoice_number}</p>
                                      <Badge
                                        variant={
                                          invoice.status === "paid"
                                            ? "success"
                                            : invoice.status === "open"
                                            ? "warning"
                                            : "destructive"
                                        }
                                        className="text-xs"
                                      >
                                        {invoice.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDate(invoice.created_at)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">
                                      {formatCurrency(Number(invoice.total), invoice.currency)}
                                    </p>
                                    {invoice.payments && invoice.payments.length > 0 && (
                                      <p className="text-xs text-muted-foreground">
                                        {invoice.payments.filter((p: any) => p.status === "completed").length} payment(s)
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {invoices.length > 5 && (
                                <Link href="/dashboard/invoices">
                                  <Button variant="ghost" size="sm" className="w-full">
                                    View All {invoices.length} Invoices
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Usage Statistics */}
                        {usageRecords.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <Activity className="h-5 w-5" />
                              Usage Statistics
                            </h3>
                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                  Total Usage
                                </p>
                                <p className="text-2xl font-bold">{totalUsage.toLocaleString()}</p>
                              </div>
                              <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                  Records
                                </p>
                                <p className="text-2xl font-bold">{usageRecords.length}</p>
                              </div>
                              <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                  Average
                                </p>
                                <p className="text-2xl font-bold">
                                  {Math.round(totalUsage / usageRecords.length).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                Recent Usage Records
                              </p>
                              <div className="space-y-2">
                                {usageRecords.slice(0, 5).map((record: any) => (
                                  <div
                                    key={record.id}
                                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                                  >
                                    <div>
                                      <p className="font-medium capitalize">
                                        {record.metric_name.replace(/_/g, " ")}
                                      </p>
                                      <p className="text-muted-foreground">
                                        {formatDate(record.recorded_at)}
                                      </p>
                                    </div>
                                    <p className="font-semibold">{record.quantity.toLocaleString()}</p>
                                  </div>
                                ))}
                                {usageRecords.length > 5 && (
                                  <Link href="/dashboard/usage">
                                    <Button variant="ghost" size="sm" className="w-full">
                                      View All Usage Records
                                      <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Plan Details */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Plan Details
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Plan Name</p>
                              <p className="text-sm font-semibold">{plan?.name}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Price</p>
                              <p className="text-sm font-semibold">
                                {formatCurrency(Number(plan?.price || 0), plan?.currency || "USD")} / {plan?.interval}
                              </p>
                            </div>
                            {plan?.features && (
                              <div className="space-y-2 md:col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Features</p>
                                <div className="rounded-lg border bg-muted/30 p-3">
                                  <pre className="text-xs whitespace-pre-wrap">
                                    {JSON.stringify(plan.features, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
                <Button
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Subscription
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <CreateSubscriptionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      {selectedSubscription && (
        <InvoicePreviewDialog
          open={invoicePreviewOpen}
          onOpenChange={setInvoicePreviewOpen}
          subscription={selectedSubscription}
        />
      )}
    </>
  )
}
