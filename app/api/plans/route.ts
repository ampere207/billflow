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
    const supabase = (await createClient()) as any

    const { data: plans, error } = await supabase
      .from("plans")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("price", { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch plans" },
        { status: 500 }
      )
    }

    return NextResponse.json({ plans: plans || [] })
  } catch (error) {
    console.error("Error fetching plans:", error)
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
    const adminSupabase = createAdminClient() as any

    const body = await request.json()
    const { name, description, price, currency, interval, features } = body

    if (!name || !price || !interval) {
      return NextResponse.json(
        { error: "Missing required fields: name, price, interval" },
        { status: 400 }
      )
    }

    const { data: plan, error } = await adminSupabase
      .from("plans")
      .insert({
        company_id: companyId,
        name,
        description: description || null,
        price: Number(price),
        currency: currency || "USD",
        interval: interval,
        features: features || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Failed to create plan", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, plan })
  } catch (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

