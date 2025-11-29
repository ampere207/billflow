import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = (session.user as any).companyId
    const supabase = await createClient()

    const { data: settings, error } = await supabase
      .from("billing_settings")
      .select("*")
      .eq("company_id", companyId)
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings: settings || null })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = (session.user as any).companyId
    const supabase = await createClient()
    const adminSupabase = createAdminClient() as any

    const body = await request.json()
    const { tax_rate, currency, invoice_prefix, payment_terms_days, webhook_url } = body

    // Check if settings exist
    const { data: existing } = await supabase
      .from("billing_settings")
      .select("id")
      .eq("company_id", companyId)
      .single()

    let result
    if (existing) {
      // Update existing
      const { data, error } = await adminSupabase
        .from("billing_settings")
        .update({
          tax_rate: tax_rate !== undefined ? Number(tax_rate) : undefined,
          currency: currency || undefined,
          invoice_prefix: invoice_prefix || undefined,
          payment_terms_days: payment_terms_days !== undefined ? Number(payment_terms_days) : undefined,
          webhook_url: webhook_url || undefined,
        })
        .eq("company_id", companyId)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: "Failed to update settings", details: error.message },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Create new
      const { data, error } = await adminSupabase
        .from("billing_settings")
        .insert({
          company_id: companyId,
          tax_rate: tax_rate !== undefined ? Number(tax_rate) : 0,
          currency: currency || "USD",
          invoice_prefix: invoice_prefix || "INV",
          payment_terms_days: payment_terms_days !== undefined ? Number(payment_terms_days) : 30,
          webhook_url: webhook_url || null,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: "Failed to create settings", details: error.message },
          { status: 500 }
        )
      }
      result = data
    }

    return NextResponse.json({ success: true, settings: result })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

