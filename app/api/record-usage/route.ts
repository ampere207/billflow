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
    const supabase = await createClient()

    // Get first active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id")
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

    // Record demo usage
    const adminSupabase = createAdminClient()
    const { data: usageRecord, error: usageError } = await adminSupabase
      .from("usage_records")
      .insert({
        company_id: companyId,
        subscription_id: subscription.id,
        metric_name: "api_calls",
        quantity: Math.floor(Math.random() * 1000) + 100,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (usageError) {
      return NextResponse.json(
        { error: "Failed to record usage" },
        { status: 500 }
      )
    }

    // Check if request wants JSON (from fetch) or redirect (from link)
    const acceptHeader = request.headers.get("accept")
    if (acceptHeader?.includes("application/json")) {
      return NextResponse.json({
        success: true,
        usage_record: usageRecord,
      })
    }
    return NextResponse.redirect(new URL("/dashboard/usage", request.url))
  } catch (error) {
    console.error("Error recording usage:", error)
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
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const body = await request.json()
    const { subscription_id, metric_name, quantity } = body

    if (!subscription_id || !metric_name || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify subscription belongs to company
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("id", subscription_id)
      .eq("company_id", companyId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      )
    }

    // Create usage record
    const { data: usageRecord, error: usageError } = await adminSupabase
      .from("usage_records")
      .insert({
        company_id: companyId,
        subscription_id: subscription_id,
        metric_name: metric_name,
        quantity: Number(quantity),
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (usageError) {
      return NextResponse.json(
        { error: "Failed to record usage" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      usage_record: usageRecord,
    })
  } catch (error) {
    console.error("Error recording usage:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
