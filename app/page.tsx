"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LoginForm } from "@/components/auth/login-form"
import { MeetingDashboard } from "@/components/meeting-dashboard"
import { meetingService, type Meeting, type Participant, type AppUser } from "@/lib/supabase"

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("meetingTrackerUser")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
      } catch (error) {
        localStorage.removeItem("meetingTrackerUser")
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user)
    localStorage.setItem("meetingTrackerUser", JSON.stringify(user))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentMeeting(null)
    setParticipants([])
    localStorage.removeItem("meetingTrackerUser")
  }

  const handleMeetingCreated = (meeting: Meeting) => {
    setCurrentMeeting(meeting)
    setParticipants([])
  }

  const handleMeetingSelected = async (meeting: Meeting, meetingParticipants: Participant[]) => {
    setCurrentMeeting(meeting)
    setParticipants(meetingParticipants)
  }

  const deleteMeeting = async (meetingId: string) => {
    if (!currentUser) return false
    const success = await meetingService.deleteMeeting(currentUser.id, meetingId)
    if (success && currentMeeting?.id === meetingId) {
      setCurrentMeeting(null)
      setParticipants([])
    }
    return success
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    )
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <MeetingDashboard
      user={currentUser}
      currentMeeting={currentMeeting}
      participants={participants}
      onMeetingCreated={handleMeetingCreated}
      onMeetingSelected={handleMeetingSelected}
      onMeetingDeleted={deleteMeeting}
      onUserLogout={handleLogout}
      setCurrentMeeting={setCurrentMeeting}
      setParticipants={setParticipants}
    />
  )
}
