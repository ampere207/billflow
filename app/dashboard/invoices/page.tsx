import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Download, Plus, FileText, Calendar, MoreVertical, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function InvoicesPage() {
  const session = await getSession()
  const supabase = await createClient()

  if (!session?.user) {
    return null
  }

  const companyId = (session.user as any).companyId

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*, subscriptions(plans(*))")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  if (error) {
    return <div>Error loading invoices</div>
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success"
      case "open":
        return "warning"
      case "void":
        return "destructive"
      case "uncollectible":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStatusGradient = (status: string) => {
    switch (status) {
      case "paid":
        return "from-green-500 to-emerald-500"
      case "open":
        return "from-orange-500 to-amber-500"
      case "void":
        return "from-red-500 to-rose-500"
      case "uncollectible":
        return "from-red-500 to-rose-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Invoices</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your invoices and payments
          </p>
        </div>
        <Link href="/api/generate-invoice">
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            Generate Invoice
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {invoices && invoices.length > 0 ? (
          invoices.map((invoice, index) => {
            const subscription = invoice.subscriptions as any
            const plan = subscription?.plans as any
            const statusGradient = getStatusGradient(invoice.status)
            return (
              <Card
                key={invoice.id}
                className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${statusGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${statusGradient} text-white shadow-lg`}>
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{invoice.invoice_number}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {plan?.name || "One-time payment"} • Due{" "}
                            {formatDate(invoice.due_date)}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusVariant(invoice.status)} className="text-sm px-3 py-1">
                        {invoice.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-3xl font-bold">
                        {formatCurrency(
                          Number(invoice.total),
                          invoice.currency
                        )}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Created {formatDate(invoice.created_at)}
                        </div>
                        {invoice.paid_at && (
                          <div className="flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-green-500" />
                            Paid {formatDate(invoice.paid_at)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
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
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-sm">
                Generate your first invoice to get started with billing
              </p>
              <Link href="/api/generate-invoice">
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Your First Invoice
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
