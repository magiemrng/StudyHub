import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          user_id: string
          name: string
          credits: number
          grade: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          credits: number
          grade: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          credits?: number
          grade?: string
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          total_classes: number
          attended_classes: number
          required_percentage: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          total_classes: number
          attended_classes: number
          required_percentage: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          total_classes?: number
          attended_classes?: number
          required_percentage?: number
          created_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          user_id: string
          name: string
          subject: string
          grade: number
          max_grade: number
          weight: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          subject: string
          grade: number
          max_grade: number
          weight: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          subject?: string
          grade?: number
          max_grade?: number
          weight?: number
          date?: string
          created_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject: string
          duration: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          duration: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          duration?: number
          date?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          subject: string
          date: string
          start_time: string
          end_time: string
          location: string
          type: string
          priority: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          subject: string
          date: string
          start_time: string
          end_time: string
          location: string
          type: string
          priority: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          subject?: string
          date?: string
          start_time?: string
          end_time?: string
          location?: string
          type?: string
          priority?: string
          created_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          message: string
          is_ai_response: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          is_ai_response: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          is_ai_response?: boolean
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          avatar_url: string | null
          status: string | null
          last_seen: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          avatar_url?: string | null
          status?: string | null
          last_seen?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          avatar_url?: string | null
          status?: string | null
          last_seen?: string | null
          created_at?: string | null
        }
      }
      chat_rooms: {
        Row: {
          id: string
          name: string | null
          description: string | null
          is_group: boolean | null
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          description?: string | null
          is_group?: boolean | null
          created_by: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          description?: string | null
          is_group?: boolean | null
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      chat_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          joined_at: string | null
          last_read_at: string | null
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          joined_at?: string | null
          last_read_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          joined_at?: string | null
          last_read_at?: string | null
        }
      }
      user_messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          message_type: string | null
          edited_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          message_type?: string | null
          edited_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          content?: string
          message_type?: string | null
          edited_at?: string | null
          created_at?: string | null
        }
      }
      student_offers: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string
          offer_link: string
          price: string | null
          discount_percentage: number
          category: string
          is_active: boolean
          expires_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url: string
          offer_link: string
          price?: string | null
          discount_percentage?: number
          category?: string
          is_active?: boolean
          expires_at?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string
          offer_link?: string
          price?: string | null
          discount_percentage?: number
          category?: string
          is_active?: boolean
          expires_at?: string | null
          created_by?: string
          created_at?: string
        }
      }
    }
  }
}