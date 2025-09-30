import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface AppUser {
  id: string
  email: string
  password_hash: string
  display_name: string
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  user_id: string
  name: string
  description?: string
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
  title: string
  content: string
  note_type: "general" | "action" | "decision" | "idea" | "issue" | "follow-up"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
  updated_at: string
}

// Auth service
export const authService = {
  // Register new user
  async register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    try {
      // Simple base64 encoding for demo (use proper hashing in production)
      const passwordHash = btoa(password)

      const { data, error } = await supabase
        .from("app_users")
        .insert([{ email, password_hash: passwordHash, display_name: displayName }])
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, user: data }
    } catch (error) {
      return { success: false, error: "Registration failed" }
    }
  },

  // Login user
  async login(email: string, password: string): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    try {
      const passwordHash = btoa(password)

      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .eq("email", email)
        .eq("password_hash", passwordHash)
        .single()

      if (error || !data) {
        return { success: false, error: "Invalid email or password" }
      }

      return { success: true, user: data }
    } catch (error) {
      return { success: false, error: "Login failed" }
    }
  },
}

// Database operations with user isolation
export const meetingService = {
  // Create a new meeting
  async createMeeting(userId: string, name: string, description?: string): Promise<Meeting | null> {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .insert([{ user_id: userId, name, description }])
        .select()
        .single()

      if (error) {
        console.error("Error creating meeting:", error)
        return null
      }
      return data
    } catch (error) {
      console.error("Error creating meeting:", error)
      return null
    }
  },

  // Get all meetings for current user
  async getAllMeetings(userId: string): Promise<Meeting[]> {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", userId)
        .order("start_time", { ascending: false })

      if (error) {
        console.error("Error fetching meetings:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error fetching meetings:", error)
      return []
    }
  },

  // Get meeting by ID
  async getMeetingById(userId: string, id: string): Promise<Meeting | null> {
    try {
      const { data, error } = await supabase.from("meetings").select("*").eq("id", id).eq("user_id", userId).single()

      if (error || !data) return null
      return data
    } catch (error) {
      console.error("Error fetching meeting:", error)
      return null
    }
  },

  // Search meetings by name for current user
  async searchMeetingsByName(userId: string, searchTerm: string): Promise<Meeting[]> {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", userId)
        .ilike("name", `%${searchTerm}%`)
        .order("start_time", { ascending: false })

      if (error) {
        console.error("Error searching meetings:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error searching meetings:", error)
      return []
    }
  },

  // End a meeting
  async endMeeting(userId: string, id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("meetings")
        .update({ status: "ended", end_time: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId)

      if (error) {
        console.error("Error ending meeting:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error ending meeting:", error)
      return false
    }
  },

  // Delete a meeting
  async deleteMeeting(userId: string, id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("meetings").delete().eq("id", id).eq("user_id", userId)

      if (error) {
        console.error("Error deleting meeting:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error deleting meeting:", error)
      return false
    }
  },
}

export const participantService = {
  // Add participant to meeting
  async addParticipant(userId: string, meetingId: string, name: string, email?: string): Promise<Participant | null> {
    try {
      const { data, error } = await supabase
        .from("participants")
        .insert([{ meeting_id: meetingId, user_id: userId, name, email }])
        .select()
        .single()

      if (error) {
        console.error("Error adding participant:", error)
        return null
      }
      return data
    } catch (error) {
      console.error("Error adding participant:", error)
      return null
    }
  },

  // Get participants for a meeting
  async getParticipantsByMeeting(userId: string, meetingId: string): Promise<Participant[]> {
    try {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("meeting_id", meetingId)
        .eq("user_id", userId)
        .order("join_time", { ascending: true })

      if (error) {
        console.error("Error fetching participants:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error fetching participants:", error)
      return []
    }
  },

  // Update speaking count - FIXED VERSION
  async awardSpeakingPoint(userId: string, participantId: string): Promise<boolean> {
    try {
      // First get the current participant data
      const { data: participant, error: fetchError } = await supabase
        .from("participants")
        .select("speaking_count")
        .eq("id", participantId)
        .eq("user_id", userId)
        .single()

      if (fetchError || !participant) {
        console.error("Error fetching participant:", fetchError)
        return false
      }

      // Update with incremented count and current timestamp
      const { error: updateError } = await supabase
        .from("participants")
        .update({
          speaking_count: participant.speaking_count + 1,
          last_spoke: new Date().toISOString(),
        })
        .eq("id", participantId)
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error updating speaking count:", updateError)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in awardSpeakingPoint:", error)
      return false
    }
  },

  // Remove participant
  async removeParticipant(userId: string, participantId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("participants").delete().eq("id", participantId).eq("user_id", userId)

      if (error) {
        console.error("Error removing participant:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error removing participant:", error)
      return false
    }
  },
}

// Notes service
export const notesService = {
  // Create a new note
  async createNote(
    userId: string,
    meetingId: string,
    title: string,
    content: string,
    noteType: MeetingNote["note_type"] = "general",
    priority: MeetingNote["priority"] = "medium",
  ): Promise<MeetingNote | null> {
    try {
      const { data, error } = await supabase
        .from("meeting_notes")
        .insert([{ user_id: userId, meeting_id: meetingId, title, content, note_type: noteType, priority }])
        .select()
        .single()

      if (error) {
        console.error("Error creating note:", error)
        return null
      }
      return data
    } catch (error) {
      console.error("Error creating note:", error)
      return null
    }
  },

  // Get all notes for a meeting
  async getNotesByMeeting(userId: string, meetingId: string): Promise<MeetingNote[]> {
    try {
      const { data, error } = await supabase
        .from("meeting_notes")
        .select("*")
        .eq("meeting_id", meetingId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching notes:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error fetching notes:", error)
      return []
    }
  },

  // Update a note
  async updateNote(
    userId: string,
    noteId: string,
    updates: Partial<Pick<MeetingNote, "title" | "content" | "note_type" | "priority">>,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("meeting_notes").update(updates).eq("id", noteId).eq("user_id", userId)

      if (error) {
        console.error("Error updating note:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error updating note:", error)
      return false
    }
  },

  // Delete a note
  async deleteNote(userId: string, noteId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("meeting_notes").delete().eq("id", noteId).eq("user_id", userId)

      if (error) {
        console.error("Error deleting note:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error deleting note:", error)
      return false
    }
  },
}
