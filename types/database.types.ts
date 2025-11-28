export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          price: number
          currency: string
          interval: 'month' | 'year'
          features: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          price: number
          currency?: string
          interval?: 'month' | 'year'
          features?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          interval?: 'month' | 'year'
          features?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          company_id: string
          plan_id: string
          user_id: string
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          plan_id: string
          user_id: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          plan_id?: string
          user_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string
          email: string
          name: string | null
          role: 'owner' | 'admin' | 'member'
          auth_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          email: string
          name?: string | null
          role?: 'owner' | 'admin' | 'member'
          auth_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          name?: string | null
          role?: 'owner' | 'admin' | 'member'
          auth_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          company_id: string
          subscription_id: string | null
          invoice_number: string
          status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          subtotal: number
          tax: number
          total: number
          currency: string
          due_date: string
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          subscription_id?: string | null
          invoice_number: string
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          subtotal: number
          tax?: number
          total: number
          currency?: string
          due_date: string
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          subscription_id?: string | null
          invoice_number?: string
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          subtotal?: number
          tax?: number
          total?: number
          currency?: string
          due_date?: string
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price: number
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          currency: string
          payment_method: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          currency?: string
          payment_method?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          currency?: string
          payment_method?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_records: {
        Row: {
          id: string
          company_id: string
          subscription_id: string
          metric_name: string
          quantity: number
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          subscription_id: string
          metric_name: string
          quantity: number
          recorded_at: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          subscription_id?: string
          metric_name?: string
          quantity?: number
          recorded_at?: string
          created_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          company_id: string
          name: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      billing_settings: {
        Row: {
          id: string
          company_id: string
          tax_rate: number
          currency: string
          invoice_prefix: string
          payment_terms_days: number
          webhook_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          tax_rate?: number
          currency?: string
          invoice_prefix?: string
          payment_terms_days?: number
          webhook_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          tax_rate?: number
          currency?: string
          invoice_prefix?: string
          payment_terms_days?: number
          webhook_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          company_id: string
          event_type: string
          payload: Json
          status: 'pending' | 'success' | 'failed'
          response_status: number | null
          response_body: string | null
          attempts: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          event_type: string
          payload: Json
          status?: 'pending' | 'success' | 'failed'
          response_status?: number | null
          response_body?: string | null
          attempts?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          event_type?: string
          payload?: Json
          status?: 'pending' | 'success' | 'failed'
          response_status?: number | null
          response_body?: string | null
          attempts?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing'
      invoice_status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
      user_role: 'owner' | 'admin' | 'member'
      webhook_status: 'pending' | 'success' | 'failed'
    }
  }
}

