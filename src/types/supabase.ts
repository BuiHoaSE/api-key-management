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
      api_keys: {
        Row: {
          id: string
          name: string
          key: string
          type: string
          usage: number
          user_id: string
          created_at: string
          updated_at: string
          description: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          name: string
          key: string
          type: string
          usage?: number
          user_id: string
          created_at?: string
          updated_at?: string
          description?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          key?: string
          type?: string
          usage?: number
          user_id?: string
          created_at?: string
          updated_at?: string
          description?: string | null
          expires_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
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
      [_ in never]: never
    }
  }
} 