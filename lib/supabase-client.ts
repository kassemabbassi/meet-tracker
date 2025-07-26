import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return supabaseClient
}

export const supabase = getSupabaseClient()

// Types for our database tables with user isolation
export interface Meeting {
  id: string
  user_id: string
  name: string
  description?: string
  password_hash: string
  start_time: string
  end_time?: string
  status: "active" | "ended" | "paused"
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  meeting_id: string
  user_id: string
  name: string
  email?: string
  join_time: string
  speaking_count: number
  last_spoke?: string
  status: "present" | "absent" | "left"
  created_at: string
  updated_at: string
}

export interface MeetingNote {
  id: string
  meeting_id: string
  user_id: string
  note_type: "general" | "action" | "objective" | "decision" | "issue"
  content: string
  assigned_to_email?: string
  assigned_to_name?: string
  priority: "low" | "medium" | "high" | "urgent"
  due_date?: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export interface MomEmail {
  id: string
  meeting_id: string
  user_id: string
  recipient_email: string
  recipient_name?: string
  email_type: "full_mom" | "action_items"
  sent_at: string
  email_status: "sent" | "failed" | "pending"
}

export interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}
