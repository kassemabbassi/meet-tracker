import { supabase } from "./supabase-client"
import type { Meeting, Participant, MeetingNote } from "./supabase-client"
import bcrypt from "bcryptjs"

export const meetingService = {
  // Create a new meeting with password protection
  async createMeeting(name: string, password: string, description?: string): Promise<Meeting | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Hash the password
      const passwordHash = await bcrypt.hash(password, 12)

      const { data, error } = await supabase
        .from("meetings")
        .insert([
          {
            user_id: user.id,
            name,
            description,
            password_hash: passwordHash,
          },
        ])
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

  // Verify meeting password
  async verifyMeetingPassword(meetingId: string, password: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      const { data: meeting, error } = await supabase
        .from("meetings")
        .select("password_hash")
        .eq("id", meetingId)
        .eq("user_id", user.id)
        .single()

      if (error || !meeting) return false

      return await bcrypt.compare(password, meeting.password_hash)
    } catch (error) {
      console.error("Error verifying password:", error)
      return false
    }
  },

  // Get all meetings for current user
  async getAllMeetings(): Promise<Meeting[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", user.id)
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

  // Get meeting by ID (with password verification)
  async getMeetingById(id: string, password?: string): Promise<Meeting | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase.from("meetings").select("*").eq("id", id).eq("user_id", user.id).single()

      if (error || !data) return null

      // If password is provided, verify it
      if (password) {
        const isValidPassword = await bcrypt.compare(password, data.password_hash)
        if (!isValidPassword) return null
      }

      return data
    } catch (error) {
      console.error("Error fetching meeting:", error)
      return null
    }
  },

  // Search meetings by name for current user
  async searchMeetingsByName(searchTerm: string): Promise<Meeting[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", user.id)
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
  async endMeeting(id: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      const { error } = await supabase
        .from("meetings")
        .update({ status: "ended", end_time: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)

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
  async deleteMeeting(id: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      const { error } = await supabase.from("meetings").delete().eq("id", id).eq("user_id", user.id)

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
  async addParticipant(meetingId: string, name: string, email?: string): Promise<Participant | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from("participants")
        .insert([{ meeting_id: meetingId, user_id: user.id, name, email }])
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
  async getParticipantsByMeeting(meetingId: string): Promise<Participant[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("meeting_id", meetingId)
        .eq("user_id", user.id)
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

  // Update speaking count
  async awardSpeakingPoint(participantId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      const { data: participant, error: fetchError } = await supabase
        .from("participants")
        .select("speaking_count")
        .eq("id", participantId)
        .eq("user_id", user.id)
        .single()

      if (fetchError) {
        console.error("Error fetching participant:", fetchError)
        return false
      }

      const { error } = await supabase
        .from("participants")
        .update({
          speaking_count: participant.speaking_count + 1,
          last_spoke: new Date().toISOString(),
        })
        .eq("id", participantId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating speaking count:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error updating speaking count:", error)
      return false
    }
  },

  // Remove participant
  async removeParticipant(participantId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      const { error } = await supabase.from("participants").delete().eq("id", participantId).eq("user_id", user.id)

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

export const notesService = {
  // Add a meeting note
  async addNote(
    meetingId: string,
    noteType: MeetingNote["note_type"],
    content: string,
    assignedToEmail?: string,
    assignedToName?: string,
    priority: MeetingNote["priority"] = "medium",
    dueDate?: string,
  ): Promise<MeetingNote | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from("meeting_notes")
        .insert([
          {
            meeting_id: meetingId,
            user_id: user.id,
            note_type: noteType,
            content,
            assigned_to_email: assignedToEmail,
            assigned_to_name: assignedToName,
            priority,
            due_date: dueDate,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error adding note:", error)
        return null
      }
      return data
    } catch (error) {
      console.error("Error adding note:", error)
      return null
    }
  },

  // Get notes for a meeting
  async getNotesByMeeting(meetingId: string): Promise<MeetingNote[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await supabase
        .from("meeting_notes")
        .select("*")
        .eq("meeting_id", meetingId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

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

  // Update note status
  async updateNoteStatus(noteId: string, status: MeetingNote["status"]): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      const { error } = await supabase.from("meeting_notes").update({ status }).eq("id", noteId).eq("user_id", user.id)

      if (error) {
        console.error("Error updating note status:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error updating note status:", error)
      return false
    }
  },

  // Delete a note
  async deleteNote(noteId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      const { error } = await supabase.from("meeting_notes").delete().eq("id", noteId).eq("user_id", user.id)

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
