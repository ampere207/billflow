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
    const adminSupabase = createAdminClient()

    // Verify API key belongs to company using admin client
    const query = adminSupabase
      .from("api_keys")
      .select("*")
      .eq("id", id as any)
      .eq("company_id", companyId as any)
      .single()
    
    const { data: apiKey, error: keyError } = await query as any

    if (keyError || !apiKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      )
    }

    // Verify it belongs to the company
    if (apiKey.company_id !== companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Revoke API key
    const updateQuery = adminSupabase
      .from("api_keys")
      .update({
        is_active: false,
      })
      .eq("id", id as any)
      .select()
      .single()
    
    const { data: updated, error: updateError } = await updateQuery as any

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

