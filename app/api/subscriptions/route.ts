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
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const body = await request.json()
    const { plan_id, user_id, status } = body

    if (!plan_id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      )
    }

    // Get current user if user_id not provided
    let userId = user_id
    if (!userId) {
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("company_id", companyId)
        .eq("email", session.user?.email)
        .single()

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }
      userId = user.id
    }

    // Verify plan belongs to company
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .eq("company_id", companyId)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      )
    }

    // Calculate period dates
    const now = new Date()
    const periodEnd = new Date(now)
    if (plan.interval === "month") {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }

    // Create subscription
    const { data: subscription, error: subError } = await (adminSupabase
      .from("subscriptions")
      .insert({
        company_id: companyId,
        plan_id: plan_id,
        user_id: userId,
        status: status || "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
      } as any)
      .select("*, plans(*)")
      .single() as any)

    if (subError) {
      return NextResponse.json(
        { error: "Failed to create subscription", details: subError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

