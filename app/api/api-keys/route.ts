import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { createHash } from "crypto"

function generateApiKey(): string {
  const prefix = "sk_live_"
  const randomBytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256)
  )
  const base64 = Buffer.from(randomBytes).toString("base64")
  return prefix + base64.replace(/[+/=]/g, (m) => {
    return { "+": "-", "/": "_", "=": "" }[m] || m
  })
}

function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = (session.user as any).companyId
    const adminSupabase = createAdminClient()

    const body = await request.json()
    const { name, expires_in_days } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Generate API key
    const apiKey = generateApiKey()
    const keyHash = hashApiKey(apiKey)
    const keyPrefix = apiKey.substring(0, 12)

    // Calculate expiration date if provided
    let expiresAt = null
    if (expires_in_days) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + Number(expires_in_days))
      expiresAt = expiryDate.toISOString()
    }

    // Store hashed key
    const { data: apiKeyRecord, error } = await (adminSupabase
      .from("api_keys")
      .insert({
        company_id: companyId,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        expires_at: expiresAt,
        is_active: true,
      } as any)
      .select()
      .single() as any)

    if (error) {
      return NextResponse.json(
        { error: "Failed to create API key", details: error.message },
        { status: 500 }
      )
    }

    // Return the full key only once (client should save it)
    return NextResponse.json({
      success: true,
      api_key: apiKey, // Only returned once!
      api_key_record: {
        ...apiKeyRecord,
        key_hash: undefined, // Don't return hash
      },
    })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

