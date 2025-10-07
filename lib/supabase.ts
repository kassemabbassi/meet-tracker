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

export interface Training {
  id: string
  user_id: string
  title: string
  description?: string
  objectives?: string
  duration?: string
  start_date?: string
  end_date?: string
  location?: string
  max_participants?: number
  status: "active" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export interface TrainingRegistration {
  id: string
  training_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  education_specialty: string  // Add this
  education_level: number       // Change from string to number
  member_type: "adherent" | "actif"  // Add this
  training_level?: "beginner" | "intermediate" | "advanced"  // Make optional
  registration_date: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface TrainingCollaborator {
  id: string
  training_id: string
  user_id: string
  collaborator_email: string
  added_by_user_id: string
  added_at: string
  created_at: string
}

// Auth service
export const authService = {
  async register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    try {
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

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.from("app_users").select("id").eq("email", email).single()

      return !error && !!data
    } catch (error) {
      return false
    }
  },

  async getUserByEmail(email: string): Promise<AppUser | null> {
    try {
      const { data, error } = await supabase.from("app_users").select("*").eq("email", email).single()

      if (error || !data) return null
      return data
    } catch (error) {
      return null
    }
  },
}

// Meeting service
export const meetingService = {
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

// Participant service
export const participantService = {
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

  async awardSpeakingPoint(userId: string, participantId: string): Promise<boolean> {
    try {
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

// Training service
export const trainingService = {
  async createTraining(
    userId: string,
    trainingData: Partial<Training>,
    collaboratorEmails: string[] = [],
  ): Promise<Training | null> {
    try {
      // Create the training
      const { data, error } = await supabase
        .from("trainings")
        .insert([{ user_id: userId, ...trainingData }])
        .select()
        .single()

      if (error) {
        console.error("Error creating training:", error)
        return null
      }

      // Add collaborators if any
      if (collaboratorEmails.length > 0 && data) {
        await trainingCollaboratorService.addCollaborators(data.id, userId, collaboratorEmails)
      }

      return data
    } catch (error) {
      console.error("Error creating training:", error)
      return null
    }
  },

  async getAllTrainings(userId: string, userEmail: string): Promise<Training[]> {
    try {
      // Get trainings created by user
      const { data: ownTrainings, error: ownError } = await supabase
        .from("trainings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (ownError) {
        console.error("Error fetching own trainings:", ownError)
      }

      // Get trainings where user is collaborator
      const { data: collaborations, error: collabError } = await supabase
        .from("training_collaborators")
        .select("training_id")
        .eq("collaborator_email", userEmail)

      if (collabError) {
        console.error("Error fetching collaborations:", collabError)
      }

      const collaboratedTrainingIds = collaborations?.map((c) => c.training_id) || []

      // Get the actual training data for collaborated trainings
      let collaboratedTrainings: Training[] = []
      if (collaboratedTrainingIds.length > 0) {
        const { data: collabTrainings, error: collabTrainingsError } = await supabase
          .from("trainings")
          .select("*")
          .in("id", collaboratedTrainingIds)
          .order("created_at", { ascending: false })

        if (collabTrainingsError) {
          console.error("Error fetching collaborated trainings:", collabTrainingsError)
        } else {
          collaboratedTrainings = collabTrainings || []
        }
      }

      // Combine and deduplicate
      const allTrainings = [...(ownTrainings || []), ...collaboratedTrainings]
      const uniqueTrainings = Array.from(new Map(allTrainings.map((t) => [t.id, t])).values())

      return uniqueTrainings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error("Error fetching trainings:", error)
      return []
    }
  },

  async getTrainingById(trainingId: string): Promise<Training | null> {
    try {
      const { data, error } = await supabase.from("trainings").select("*").eq("id", trainingId).single()

      if (error || !data) return null
      return data
    } catch (error) {
      console.error("Error fetching training:", error)
      return null
    }
  },

  async canUserManageTraining(userId: string, userEmail: string, trainingId: string): Promise<boolean> {
    try {
      // Check if user is the creator
      const { data: training, error: trainingError } = await supabase
        .from("trainings")
        .select("user_id")
        .eq("id", trainingId)
        .single()

      if (!trainingError && training && training.user_id === userId) {
        return true
      }

      // Check if user is a collaborator
      const { data: collab, error: collabError } = await supabase
        .from("training_collaborators")
        .select("id")
        .eq("training_id", trainingId)
        .eq("collaborator_email", userEmail)
        .single()

      return !collabError && !!collab
    } catch (error) {
      console.error("Error checking training access:", error)
      return false
    }
  },

  async updateTraining(
    userId: string,
    userEmail: string,
    trainingId: string,
    updates: Partial<Training>,
  ): Promise<boolean> {
    try {
      // Check if user can manage this training
      const canManage = await this.canUserManageTraining(userId, userEmail, trainingId)
      if (!canManage) {
        console.error("User does not have permission to update this training")
        return false
      }

      const { error } = await supabase.from("trainings").update(updates).eq("id", trainingId)

      if (error) {
        console.error("Error updating training:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error updating training:", error)
      return false
    }
  },

  async updateTrainingStatus(
    userId: string,
    userEmail: string,
    trainingId: string,
    status: Training["status"],
  ): Promise<boolean> {
    return this.updateTraining(userId, userEmail, trainingId, { status })
  },

  async deleteTraining(userId: string, userEmail: string, trainingId: string): Promise<boolean> {
    try {
      // Check if user can manage this training
      const canManage = await this.canUserManageTraining(userId, userEmail, trainingId)
      if (!canManage) {
        console.error("User does not have permission to delete this training")
        return false
      }

      const { error } = await supabase.from("trainings").delete().eq("id", trainingId)

      if (error) {
        console.error("Error deleting training:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error deleting training:", error)
      return false
    }
  },
}

// Training Collaborator service
export const trainingCollaboratorService = {
  async addCollaborators(trainingId: string, addedByUserId: string, emails: string[]): Promise<boolean> {
    try {
      // Get the creator's user_id for reference
      const { data: training } = await supabase.from("trainings").select("user_id").eq("id", trainingId).single()

      if (!training) return false

      // Verify all emails exist in the database
      const validEmails: string[] = []
      for (const email of emails) {
        const exists = await authService.checkEmailExists(email)
        if (exists) {
          validEmails.push(email)
        }
      }

      if (validEmails.length === 0) return false

      // Insert collaborators
      const collaborators = validEmails.map((email) => ({
        training_id: trainingId,
        user_id: training.user_id,
        collaborator_email: email,
        added_by_user_id: addedByUserId,
      }))

      const { error } = await supabase.from("training_collaborators").insert(collaborators)

      if (error) {
        console.error("Error adding collaborators:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error adding collaborators:", error)
      return false
    }
  },

  async getTrainingCollaborators(trainingId: string): Promise<TrainingCollaborator[]> {
    try {
      const { data, error } = await supabase
        .from("training_collaborators")
        .select("*")
        .eq("training_id", trainingId)
        .order("added_at", { ascending: false })

      if (error) {
        console.error("Error fetching collaborators:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error fetching collaborators:", error)
      return []
    }
  },

  async removeCollaborator(trainingId: string, collaboratorEmail: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("training_collaborators")
        .delete()
        .eq("training_id", trainingId)
        .eq("collaborator_email", collaboratorEmail)

      if (error) {
        console.error("Error removing collaborator:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error removing collaborator:", error)
      return false
    }
  },
}

// Training Registration service
export const trainingRegistrationService = {
  async registerParticipant(
    registrationData: Omit<TrainingRegistration, "id" | "registration_date" | "status" | "created_at" | "updated_at">,
  ): Promise<TrainingRegistration | null> {
    try {
      const { data, error } = await supabase.from("training_registrations").insert([registrationData]).select().single()

      if (error) {
        console.error("Error registering participant:", error)
        return null
      }
      return data
    } catch (error) {
      console.error("Error registering participant:", error)
      return null
    }
  },

  async getTrainingRegistrations(trainingId: string): Promise<TrainingRegistration[]> {
    try {
      const { data, error } = await supabase
        .from("training_registrations")
        .select("*")
        .eq("training_id", trainingId)
        .order("registration_date", { ascending: false })

      if (error) {
        console.error("Error fetching registrations:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error fetching registrations:", error)
      return []
    }
  },

  async updateRegistrationStatus(registrationId: string, status: TrainingRegistration["status"]): Promise<boolean> {
    try {
      const { error } = await supabase.from("training_registrations").update({ status }).eq("id", registrationId)

      if (error) {
        console.error("Error updating registration status:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error updating registration status:", error)
      return false
    }
  },

  async deleteRegistration(registrationId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("training_registrations").delete().eq("id", registrationId)

      if (error) {
        console.error("Error deleting registration:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error deleting registration:", error)
      return false
    }
  },
}
