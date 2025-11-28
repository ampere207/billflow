import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function SettingsPage() {
  const session = await getSession()
  const supabase = await createClient()

  if (!session?.user) {
    return null
  }

  const companyId = (session.user as any).companyId

  const { data: settings, error } = await supabase
    .from("billing_settings")
    .select("*")
    .eq("company_id", companyId)
    .single()

  if (error && error.code !== "PGRST116") {
    return <div>Error loading settings</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your billing and company settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Settings</CardTitle>
          <CardDescription>
            Configure your billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              step="0.01"
              defaultValue={settings?.tax_rate || 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              defaultValue={settings?.currency || "USD"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
            <Input
              id="invoice-prefix"
              defaultValue={settings?.invoice_prefix || "INV"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-terms">Payment Terms (days)</Label>
            <Input
              id="payment-terms"
              type="number"
              defaultValue={settings?.payment_terms_days || 30}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              defaultValue={settings?.webhook_url || ""}
              placeholder="https://your-domain.com/webhook"
            />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPageContent

