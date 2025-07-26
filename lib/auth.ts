import { supabase } from "./supabase-client"
import type { User } from "./supabase-client"

export const authService = {
  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      console.error("Error signing in with Google:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting current user:", error)
      return null
    }

    return user as User | null
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user as User | null)
    })
  },
}
