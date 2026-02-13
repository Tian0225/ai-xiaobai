/**
 * Supabase 数据库类型定义
 *
 * 需要在 Supabase 中创建以下表：
 *
 * 1. profiles 表（用户配置）
 *    - id (uuid, primary key, references auth.users)
 *    - email (text)
 *    - is_member (boolean, default false)
 *    - membership_expires_at (timestamp)
 *    - token_balance (integer, default 0)
 *    - created_at (timestamp)
 *    - updated_at (timestamp)
 *
 * 2. orders 表（订单）
 *    - id (uuid, primary key)
 *    - order_id (text, unique)
 *    - user_id (uuid, references auth.users)
 *    - user_email (text)
 *    - amount (numeric)
 *    - payment_method (text: 'wechat' | 'alipay')
 *    - status (text: 'pending' | 'paid' | 'expired' | 'cancelled')
 *    - transaction_id (text, nullable)
 *    - created_at (timestamp)
 *    - paid_at (timestamp, nullable)
 *    - expires_at (timestamp)
 *
 * 3. token_ledger 表（代币流水）
 *    - id (uuid, primary key)
 *    - user_id (uuid, references auth.users)
 *    - user_email (text)
 *    - order_id (text, nullable)
 *    - biz_type (text: 'token_basic' | 'token_pro' | 'token_consume')
 *    - change_amount (integer)
 *    - balance_after (integer)
 *    - note (text, nullable)
 *    - created_at (timestamp)
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          is_member: boolean
          membership_expires_at: string | null
          token_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          is_member?: boolean
          membership_expires_at?: string | null
          token_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          is_member?: boolean
          membership_expires_at?: string | null
          token_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_id: string
          user_id: string
          user_email: string
          amount: number
          payment_method: 'wechat' | 'alipay'
          status: 'pending' | 'paid' | 'expired' | 'cancelled'
          transaction_id: string | null
          created_at: string
          paid_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          user_email: string
          amount: number
          payment_method: 'wechat' | 'alipay'
          status?: 'pending' | 'paid' | 'expired' | 'cancelled'
          transaction_id?: string | null
          created_at?: string
          paid_at?: string | null
          expires_at: string
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          user_email?: string
          amount?: number
          payment_method?: 'wechat' | 'alipay'
          status?: 'pending' | 'paid' | 'expired' | 'cancelled'
          transaction_id?: string | null
          created_at?: string
          paid_at?: string | null
          expires_at?: string
        }
      }
      token_ledger: {
        Row: {
          id: string
          user_id: string
          user_email: string
          order_id: string | null
          biz_type: 'token_basic' | 'token_pro' | 'token_consume'
          change_amount: number
          balance_after: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          order_id?: string | null
          biz_type: 'token_basic' | 'token_pro' | 'token_consume'
          change_amount: number
          balance_after?: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          order_id?: string | null
          biz_type?: 'token_basic' | 'token_pro' | 'token_consume'
          change_amount?: number
          balance_after?: number
          note?: string | null
          created_at?: string
        }
      }
      admin_operation_logs: {
        Row: {
          id: string
          actor_email: string
          action: 'member_activate' | 'member_revoke' | 'member_restore' | 'order_verify'
          target_user_id: string | null
          target_user_email: string | null
          target_order_id: string | null
          result: 'success' | 'failed'
          detail: Record<string, unknown>
          operator_ip: string | null
          operator_user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_email: string
          action: 'member_activate' | 'member_revoke' | 'member_restore' | 'order_verify'
          target_user_id?: string | null
          target_user_email?: string | null
          target_order_id?: string | null
          result: 'success' | 'failed'
          detail?: Record<string, unknown>
          operator_ip?: string | null
          operator_user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_email?: string
          action?: 'member_activate' | 'member_revoke' | 'member_restore' | 'order_verify'
          target_user_id?: string | null
          target_user_email?: string | null
          target_order_id?: string | null
          result?: 'success' | 'failed'
          detail?: Record<string, unknown>
          operator_ip?: string | null
          operator_user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
