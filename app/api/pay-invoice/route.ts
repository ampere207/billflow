import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

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
    const { invoice_id } = body

    if (!invoice_id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      )
    }

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .eq("company_id", companyId)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      )
    }

    if (invoice.status === "paid") {
      return NextResponse.json(
        { error: "Invoice already paid" },
        { status: 400 }
      )
    }

    // Create payment (demo - always succeeds)
    const { data: payment, error: paymentError } = await adminSupabase
      .from("payments")
      .insert({
        invoice_id: invoice_id,
        amount: Number(invoice.total),
        currency: invoice.currency,
        payment_method: "demo_card",
        status: "completed",
        transaction_id: `txn_${Date.now()}`,
      })
      .select()
      .single()

    if (paymentError) {
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      )
    }

    // Update invoice status
    await adminSupabase
      .from("invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", invoice_id)

    // Get billing settings for webhook
    const { data: settings } = await adminSupabase
      .from("billing_settings")
      .select("webhook_url")
      .eq("company_id", companyId)
      .single()

    // Log webhook event
    if (settings?.webhook_url) {
      await adminSupabase.from("webhooks").insert({
        company_id: companyId,
        event_type: "payment.completed",
        payload: {
          invoice_id: invoice_id,
          payment_id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
        },
        status: "pending",
      })
    }

    return NextResponse.json({
      success: true,
      payment: payment,
    })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

