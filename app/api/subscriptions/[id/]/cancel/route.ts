import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const id = String(params.id)
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      )
    }
    const companyId = (session.user as any).companyId
    const adminSupabase = createAdminClient() as any

    // Verify subscription belongs to company using admin client
    const { data: subscription, error: subError } = await adminSupabase
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .eq("company_id", companyId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      )
    }

    // Verify it belongs to the company
    if (subscription.company_id !== companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Cancel subscription
    const { data: updated, error: updateError } = await adminSupabase
      .from("subscriptions")
      .update({ status: "canceled", cancel_at_period_end: true })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to cancel subscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, subscription: updated })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

