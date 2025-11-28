import NextAuth, { type NextAuthOptions } from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { createClient } from "@/lib/supabase/server"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const supabase = await createClient()
        
        // For demo purposes, we'll use a simple check
        // In production, use Supabase Auth properly
        const { data, error } = await supabase
          .from('users')
          .select('*, companies(*)')
          .eq('email', credentials.email)
          .single()

        if (error || !data) {
          return null
        }

        // Demo: accept any password for demo users
        // In production, verify password hash
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          companyId: data.company_id,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.companyId = (user as any).companyId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).companyId = token.companyId
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

