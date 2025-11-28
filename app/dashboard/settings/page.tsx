"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState({
    tax_rate: "0",
    currency: "USD",
    invoice_prefix: "INV",
    payment_terms_days: "30",
    webhook_url: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      if (data.settings) {
        setSettings({
          tax_rate: String(data.settings.tax_rate || 0),
          currency: data.settings.currency || "USD",
          invoice_prefix: data.settings.invoice_prefix || "INV",
          payment_terms_days: String(data.settings.payment_terms_days || 30),
          webhook_url: data.settings.webhook_url || "",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings",
      })
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tax_rate: settings.tax_rate,
          currency: settings.currency,
          invoice_prefix: settings.invoice_prefix,
          payment_terms_days: settings.payment_terms_days,
          webhook_url: settings.webhook_url,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings")
      }

      toast({
        variant: "success",
        title: "Success",
        description: "Settings updated successfully",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update settings",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your billing and company settings
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your billing and company settings
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Billing Settings</CardTitle>
          <CardDescription>
            Configure your billing preferences and defaults
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.tax_rate}
                  onChange={(e) =>
                    setSettings({ ...settings, tax_rate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  placeholder="USD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                <Input
                  id="invoice-prefix"
                  value={settings.invoice_prefix}
                  onChange={(e) =>
                    setSettings({ ...settings, invoice_prefix: e.target.value })
                  }
                  placeholder="INV"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-terms">Payment Terms (days)</Label>
                <Input
                  id="payment-terms"
                  type="number"
                  min="1"
                  value={settings.payment_terms_days}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment_terms_days: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                value={settings.webhook_url}
                onChange={(e) =>
                  setSettings({ ...settings, webhook_url: e.target.value })
                }
                placeholder="https://your-domain.com/webhook"
              />
              <p className="text-xs text-muted-foreground">
                Webhook URL for receiving billing events
              </p>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
