import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = (session.user as any).companyId
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Verify API key belongs to company
    const { data: apiKey, error: keyError } = await supabase
      .from("api_keys")
      .select("*")
      .eq("id", params.id)
      .eq("company_id", companyId)
      .single()

    if (keyError || !apiKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      )
    }

    // Revoke API key
    const { data: updated, error: updateError } = await adminSupabase
      .from("api_keys")
      .update({
        is_active: false,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to revoke API key" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, api_key: updated })
  } catch (error) {
    console.error("Error revoking API key:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

