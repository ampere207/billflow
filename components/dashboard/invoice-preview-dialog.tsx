"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { FileText, Download, X } from "lucide-react"

interface InvoicePreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: {
    id: string
    plans: any
    current_period_start: string
    current_period_end: string
  }
}

export function InvoicePreviewDialog({
  open,
  onOpenChange,
  subscription,
}: InvoicePreviewProps) {
  const plan = subscription.plans as any
  
  // Generate dummy invoice data
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${subscription.id.slice(0, 8).toUpperCase()}`
  const subtotal = Number(plan?.price || 0)
  const tax = subtotal * 0.085 // 8.5% tax
  const total = subtotal + tax
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Preview
          </DialogTitle>
          <DialogDescription>
            Preview of the invoice that would be generated
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Invoice Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold">BillFlow</h2>
              <p className="text-sm text-muted-foreground">Billing Platform</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Invoice</p>
              <p className="text-lg font-bold">{invoiceNumber}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Bill To</p>
              <div className="space-y-1">
                <p className="font-medium">Your Company</p>
                <p className="text-sm text-muted-foreground">123 Business St</p>
                <p className="text-sm text-muted-foreground">City, State 12345</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Invoice Details</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span>{formatDate(new Date().toISOString())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{formatDate(dueDate.toISOString())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="warning">Open</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Period */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Subscription Period</p>
            <p className="text-sm">
              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
            </p>
          </div>

          {/* Invoice Items */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Items</p>
            <div className="rounded-lg border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Description</th>
                    <th className="text-center p-3 text-sm font-medium">Quantity</th>
                    <th className="text-right p-3 text-sm font-medium">Unit Price</th>
                    <th className="text-right p-3 text-sm font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">
                      <p className="font-medium">{plan?.name || "Subscription"}</p>
                      <p className="text-sm text-muted-foreground">
                        {plan?.interval === "month" ? "Monthly" : "Yearly"} Subscription
                      </p>
                    </td>
                    <td className="p-3 text-center">1</td>
                    <td className="p-3 text-right">
                      {formatCurrency(subtotal, plan?.currency || "USD")}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(subtotal, plan?.currency || "USD")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(subtotal, plan?.currency || "USD")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8.5%):</span>
                <span>{formatCurrency(tax, plan?.currency || "USD")}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(total, plan?.currency || "USD")}</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="rounded-lg border border-dashed bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground text-center">
              This is a preview. In a production environment, this invoice would be generated and stored in the database.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

