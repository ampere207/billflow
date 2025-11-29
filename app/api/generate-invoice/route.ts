import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    const companyId = (session.user as any).companyId
    const supabase = (await createClient()) as any
    const adminSupabase = createAdminClient() as any

    // Get first active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, plans(*), companies(*)")
      .eq("company_id", companyId)
      .eq("status", "active")
      .limit(1)
      .single()

    if (!subscription) {
      // Check if there are any subscriptions at all
      const { data: anySub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("company_id", companyId)
        .limit(1)
        .single()

      if (!anySub) {
        return NextResponse.json(
          { error: "No subscriptions found. Please create a subscription first." },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: "No active subscription found. Please activate a subscription first." },
        { status: 404 }
      )
    }

    const plan = subscription.plans as any

    // Get billing settings
    const { data: settings } = await adminSupabase
      .from("billing_settings")
      .select("*")
      .eq("company_id", companyId)
      .single()

    const subtotal = Number(plan.price)
    const taxRate = settings?.tax_rate || 0
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    // Generate invoice number
    const prefix = settings?.invoice_prefix || "INV"
    const invoiceNumber = `${prefix}-${Date.now().toString().slice(-6)}-${subscription.id.slice(0, 8).toUpperCase()}`

    // Calculate due date
    const dueDate = new Date()
    dueDate.setDate(
      dueDate.getDate() + (settings?.payment_terms_days || 30)
    )

    // Create invoice
    const { data: invoice, error: invoiceError } = await adminSupabase
      .from("invoices")
      .insert({
        company_id: companyId,
        subscription_id: subscription.id,
        invoice_number: invoiceNumber,
        status: "open",
        subtotal: subtotal,
        tax: tax,
        total: total,
        currency: plan.currency || "USD",
        due_date: dueDate.toISOString(),
      })
      .select()
      .single()

    if (invoiceError) {
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500 }
      )
    }

    // Create invoice items
    await adminSupabase.from("invoice_items").insert({
      invoice_id: invoice.id,
      description: `${plan.name} - ${plan.interval === "month" ? "Monthly" : "Yearly"} Subscription`,
      quantity: 1,
      unit_price: subtotal,
      amount: subtotal,
    })

    // Log webhook event
    if (settings?.webhook_url) {
      await adminSupabase.from("webhooks").insert({
        company_id: companyId,
        event_type: "invoice.created",
        payload: {
          invoice_id: invoice.id,
          invoice_number: invoiceNumber,
          amount: total,
          currency: plan.currency,
        },
        status: "pending",
      })
    }

    return NextResponse.redirect(new URL("/dashboard/invoices", request.url))
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = (session.user as any).companyId
    const supabase = (await createClient()) as any
    const adminSupabase = createAdminClient() as any

    const body = await request.json()
    const subscription_id = body.subscription_id

    if (!subscription_id) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      )
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*, plans(*), companies(*)")
      .eq("id", subscription_id)
      .eq("company_id", companyId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      )
    }

    const plan = subscription.plans as any
    const company = subscription.companies as any

    // Get billing settings
    const { data: settings } = await adminSupabase
      .from("billing_settings")
      .select("*")
      .eq("company_id", companyId)
      .single()

    const subtotal = Number(plan.price)
    const taxRate = settings?.tax_rate || 0
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    // Generate invoice number
    const prefix = settings?.invoice_prefix || "INV"
    const invoiceNumber = `${prefix}-${Date.now().toString().slice(-6)}-${subscription.id.slice(0, 8).toUpperCase()}`

    // Calculate due date
    const dueDate = new Date()
    dueDate.setDate(
      dueDate.getDate() + (settings?.payment_terms_days || 30)
    )

    // Create invoice
    const { data: invoice, error: invoiceError } = await adminSupabase
      .from("invoices")
      .insert({
        company_id: companyId,
        subscription_id: subscription_id,
        invoice_number: invoiceNumber,
        status: "open",
        subtotal: subtotal,
        tax: tax,
        total: total,
        currency: plan.currency || "USD",
        due_date: dueDate.toISOString(),
      })
      .select()
      .single()

    if (invoiceError) {
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500 }
      )
    }

    // Create invoice items
    await adminSupabase.from("invoice_items").insert({
      invoice_id: invoice.id,
      description: `${plan.name} - ${plan.interval === "month" ? "Monthly" : "Yearly"} Subscription`,
      quantity: 1,
      unit_price: subtotal,
      amount: subtotal,
    })

    // Log webhook event
    if (settings?.webhook_url) {
      await adminSupabase.from("webhooks").insert({
        company_id: companyId,
        event_type: "invoice.created",
        payload: {
          invoice_id: invoice.id,
          invoice_number: invoiceNumber,
          amount: total,
          currency: plan.currency,
        },
        status: "pending",
      })
    }

    // Check if request wants JSON (from fetch) or redirect (from link)
    const acceptHeader = request.headers.get("accept")
    if (acceptHeader?.includes("application/json")) {
      return NextResponse.json({
        success: true,
        invoice: {
          ...invoice,
          plan: plan.name,
        },
      })
    }
    return NextResponse.redirect(new URL("/dashboard/invoices", request.url))
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
