"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Users,
  UserPlus,
  MessageSquare,
  Download,
  Moon,
  Sun,
  Trash2,
  Award,
  Clock,
  BarChart3,
  Calendar,
  Square,
  Sparkles,
  Activity,
  LogOut,
  Shield,
  User,
} from "lucide-react"
import { useTheme } from "next-themes"
import { CreateMeetingDialog } from "@/components/create-meeting-dialog"
import { MeetingHistoryDialog } from "@/components/meeting-history-dialog"
import { participantService, type Meeting, type Participant, meetingService, type AppUser } from "@/lib/supabase"

interface MeetingDashboardProps {
  user: AppUser
  currentMeeting: Meeting | null
  participants: Participant[]
  onMeetingCreated: (meeting: Meeting) => void
  onMeetingSelected: (meeting: Meeting, participants: Participant[]) => void
  onMeetingDeleted: (meetingId: string) => Promise<boolean>
  onUserLogout: () => void
  setCurrentMeeting: (meeting: Meeting | null) => void
  setParticipants: (participants: Participant[]) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
}

const cardVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
}

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export function MeetingDashboard({
  user,
  currentMeeting,
  participants,
  onMeetingCreated,
  onMeetingSelected,
  onMeetingDeleted,
  onUserLogout,
  setCurrentMeeting,
  setParticipants,
}: MeetingDashboardProps) {
  const [newParticipantName, setNewParticipantName] = useState("")
  const [newParticipantEmail, setNewParticipantEmail] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "points" | "joinTime">("points")
  const [isLoading, setIsLoading] = useState(false)
  const { theme, setTheme } = useTheme()

  const addParticipant = async () => {
    if (!newParticipantName.trim() || !currentMeeting) return

    setIsLoading(true)
    try {
      const participant = await participantService.addParticipant(
        user.id,
        currentMeeting.id,
        newParticipantName.trim(),
        newParticipantEmail.trim() || undefined,
      )

      if (participant) {
        setParticipants([...participants, participant])
        setNewParticipantName("")
        setNewParticipantEmail("")
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding participant:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeParticipant = async (participantId: string) => {
    const success = await participantService.removeParticipant(user.id, participantId)
    if (success) {
      setParticipants(participants.filter((p) => p.id !== participantId))
    }
  }

  const awardSpeakingPoint = async (participantId: string) => {
    if (!currentMeeting) return

    const success = await participantService.awardSpeakingPoint(user.id, participantId)
    if (success) {
      // Refresh participants data from database to ensure accuracy
      const updatedParticipants = await participantService.getParticipantsByMeeting(user.id, currentMeeting.id)
      setParticipants(updatedParticipants)
    }
  }

  const endCurrentMeeting = async () => {
    if (!currentMeeting) return

    const success = await meetingService.endMeeting(user.id, currentMeeting.id)
    if (success) {
      setCurrentMeeting({ ...currentMeeting, status: "ended", end_time: new Date().toISOString() })
    }
  }

  const sortedParticipants = [...participants].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "points":
        return b.speaking_count - a.speaking_count
      case "joinTime":
        return new Date(a.join_time).getTime() - new Date(b.join_time).getTime()
      default:
        return 0
    }
  })

  // Export functions
  const exportToExcel = (data: any[], filename: string) => {
    let htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:x="urn:schemas-microsoft-com:office:excel" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <meta name="ProgId" content="Excel.Sheet">
      <meta name="Generator" content="Microsoft Excel 11">
    </head>
    <body>
      <table border="1">
        <tr style="background-color: #3B82F6; color: white; font-weight: bold;">
  `

    const headers = Object.keys(data[0] || {})
    headers.forEach((header) => {
      htmlContent += `<td>${header}</td>`
    })
    htmlContent += "</tr>"

    data.forEach((row) => {
      htmlContent += "<tr>"
      headers.forEach((header) => {
        const value = row[header] || ""
        htmlContent += `<td>${String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`
      })
      htmlContent += "</tr>"
    })

    htmlContent += `
      </table>
    </body>
    </html>
  `

    const blob = new Blob([htmlContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    })

    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", filename.replace(".xlsx", ".xls"))
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const exportAttendance = () => {
    const attendanceData = participants.map((p) => ({
      Name: p.name,
      Email: p.email || "N/A",
      "Join Time": new Date(p.join_time).toLocaleString(),
      Status: p.status,
      Meeting: currentMeeting?.name || "Unknown",
      User: user.display_name,
    }))

    if (attendanceData.length === 0) {
      alert("No participants to export")
      return
    }

    exportToExcel(attendanceData, "meeting-attendance.xls")
  }

  const exportParticipation = () => {
    const participationData = participants.map((p) => ({
      Name: p.name,
      Email: p.email || "N/A",
      "Join Time": new Date(p.join_time).toLocaleString(),
      "Speaking Points": p.speaking_count,
      "Last Spoke": p.last_spoke ? new Date(p.last_spoke).toLocaleString() : "Never",
      Meeting: currentMeeting?.name || "Unknown",
      User: user.display_name,
    }))

    if (participationData.length === 0) {
      alert("No participants to export")
      return
    }

    exportToExcel(participationData, "meeting-participation.xls")
  }

  const totalSpeakingPoints = participants.reduce((sum, p) => sum + p.speaking_count, 0)
  const activeSpeakers = participants.filter((p) => p.speaking_count > 0).length
  const meetingDuration = currentMeeting
    ? Math.floor((Date.now() - new Date(currentMeeting.start_time).getTime()) / 1000 / 60)
    : 0

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-1000 ease-in-out relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="flex flex-col space-y-4 sm:space-y-6 mb-6 sm:mb-8 lg:mb-12" variants={itemVariants}>
          {/* Title Section */}
          <div className="text-center lg:text-left">
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div
                className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg"
                variants={floatingVariants}
                animate="animate"
              >
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </motion.div>
              <div>
                <motion.h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Chkoun Hadher 
                </motion.h1>
                <motion.p
                  className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 font-medium mt-1 sm:mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  Professional Meeting Tracker with Enhanced Security
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* User Info & Action Buttons - Enhanced */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border border-blue-200 dark:border-blue-700">
              <Avatar className="w-12 h-12 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                  {getInitials(user.display_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <span>{user.display_name}</span>
                  <Shield className="h-5 w-5 text-blue-600" />
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="font-semibold">Private Session</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <MeetingHistoryDialog
                  userId={user.id}
                  onMeetingSelected={onMeetingSelected}
                  onMeetingDeleted={onMeetingDeleted}
                />
                <CreateMeetingDialog userId={user.id} onMeetingCreated={onMeetingCreated} />
              </div>
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ rotate: 180 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-300 shadow-lg hover:shadow-xl w-10 h-10 sm:w-12 sm:h-12"
                  >
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-blue-600" />
                    <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-blue-400" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onUserLogout}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 transition-all duration-300 shadow-lg hover:shadow-xl w-10 h-10 sm:w-12 sm:h-12 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Current Meeting Info */}
        <AnimatePresence>
          {currentMeeting && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="mb-6 sm:mb-8"
            >
              <Card className="border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <motion.div
                        className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-lg sm:text-xl lg:text-2xl">
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                            {currentMeeting.name}
                          </span>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Badge
                              className={
                                currentMeeting.status === "active"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                  : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                              }
                            >
                              <Activity className="h-3 w-3 mr-1" />
                              {currentMeeting.status}
                            </Badge>
                          </motion.div>
                        </CardTitle>
                        {currentMeeting.description && (
                          <CardDescription className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">
                            {currentMeeting.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    {currentMeeting.status === "active" && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
                        <Button
                          onClick={endCurrentMeeting}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg text-xs sm:text-sm"
                        >
                          <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          End Meeting
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!currentMeeting ? (
          <motion.div
            className="text-center py-12 sm:py-16 lg:py-20"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="mb-6 sm:mb-8" variants={floatingVariants} animate="animate">
              <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-2xl">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
              </div>
            </motion.div>
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome {user.display_name}!
            </motion.h2>
            <motion.p
              className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Create secure meetings with complete data isolation. Your meetings are private and only accessible to you.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <CreateMeetingDialog userId={user.id} onMeetingCreated={onMeetingCreated} />
              <MeetingHistoryDialog
                userId={user.id}
                onMeetingSelected={onMeetingSelected}
                onMeetingDeleted={onMeetingDeleted}
              />
            </motion.div>
          </motion.div>
        ) : (
          <>
            {/* Stats Cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
              variants={containerVariants}
            >
              {[
                {
                  icon: Users,
                  value: participants.length,
                  label: "Total Participants",
                  gradient: "from-blue-500 to-cyan-500",
                  bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30",
                  borderColor: "border-blue-200 dark:border-blue-700",
                },
                {
                  icon: MessageSquare,
                  value: activeSpeakers,
                  label: "Active Speakers",
                  gradient: "from-emerald-500 to-green-500",
                  bgGradient: "from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30",
                  borderColor: "border-emerald-200 dark:border-emerald-700",
                },
                {
                  icon: BarChart3,
                  value: totalSpeakingPoints,
                  label: "Total Interactions",
                  gradient: "from-purple-500 to-violet-500",
                  bgGradient: "from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30",
                  borderColor: "border-purple-200 dark:border-purple-700",
                },
                {
                  icon: Clock,
                  value: `${meetingDuration}m`,
                  label: "Meeting Duration",
                  gradient: "from-orange-500 to-amber-500",
                  bgGradient: "from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30",
                  borderColor: "border-orange-200 dark:border-orange-700",
                },
              ].map((stat, index) => (
                <motion.div key={index} variants={cardVariants} whileHover="hover" className="cursor-pointer">
                  <Card
                    className={`bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor} border-2 shadow-xl backdrop-blur-sm h-full`}
                  >
                    <CardContent className="p-3 sm:p-4 lg:p-6 h-full">
                      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4 h-full">
                        <motion.div
                          className={`p-2 sm:p-3 lg:p-4 bg-gradient-to-br ${stat.gradient} rounded-lg lg:rounded-2xl shadow-lg flex-shrink-0`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                        </motion.div>
                        <div className="text-center sm:text-left flex-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                            {stat.label}
                          </p>
                          <motion.p
                            className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100"
                            key={stat.value}
                            initial={{ scale: 1.2, opacity: 0.7 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            {stat.value}
                          </motion.p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Content */}
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="participants" className="space-y-6 sm:space-y-8">
                <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-700 shadow-lg h-auto">
                  <TabsTrigger
                    value="participants"
                    className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Participants</span>
                    <span className="sm:hidden">People</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="participation"
                    className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                  >
                    <Award className="h-4 w-4" />
                    <span className="hidden sm:inline">Participation</span>
                    <span className="sm:hidden">Points</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="exports"
                    className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exports</span>
                    <span className="sm:hidden">Export</span>
                  </TabsTrigger>
                </TabsList>

                {/* Participants Tab */}
                <TabsContent value="participants" className="space-y-4 sm:space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-700 shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-t-lg p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Participants
                              </CardTitle>
                              <CardDescription className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                                Manage meeting attendees
                              </CardDescription>
                            </div>
                          </div>
                          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg text-xs sm:text-sm w-full sm:w-auto"
                                  disabled={currentMeeting?.status !== "active"}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Add Participant
                                </Button>
                              </motion.div>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-blue-200 dark:border-blue-700 mx-2">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                                  <UserPlus className="h-5 w-5 text-blue-600" />
                                  <span>Add Participant</span>
                                </DialogTitle>
                                <DialogDescription className="text-sm sm:text-base">
                                  Add a new participant to the meeting
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="name" className="text-sm sm:text-base">
                                    Participant Name
                                  </Label>
                                  <Input
                                    id="name"
                                    value={newParticipantName}
                                    onChange={(e) => setNewParticipantName(e.target.value)}
                                    placeholder="Enter participant name"
                                    className="border-blue-200 dark:border-blue-700 focus:ring-blue-500 text-sm sm:text-base h-10 sm:h-12"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="email" className="text-sm sm:text-base">
                                    Email Address (Optional)
                                  </Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={newParticipantEmail}
                                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className="border-blue-200 dark:border-blue-700 focus:ring-blue-500 text-sm sm:text-base h-10 sm:h-12"
                                  />
                                </div>
                              </div>
                              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                                <Button
                                  variant="outline"
                                  onClick={() => setIsAddDialogOpen(false)}
                                  disabled={isLoading}
                                  className="border-blue-200 dark:border-blue-700 w-full sm:w-auto"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={addParticipant}
                                  disabled={isLoading || !newParticipantName.trim()}
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full sm:w-auto"
                                >
                                  {isLoading ? "Adding..." : "Add"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <AnimatePresence>
                          {participants.length === 0 ? (
                            <motion.div
                              className="text-center py-12 sm:py-16"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                            >
                              <motion.div
                                className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-xl"
                                variants={floatingVariants}
                                animate="animate"
                              >
                                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                              </motion.div>
                              <h3 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                No participants yet
                              </h3>
                              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
                                Add your first participant to get started
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div className="space-y-3 sm:space-y-4" layout>
                              {sortedParticipants.map((participant, index) => (
                                <motion.div
                                  key={participant.id}
                                  layout
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border border-blue-100 dark:border-blue-800 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 space-y-3 sm:space-y-0"
                                >
                                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                                    <motion.div
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 shadow-lg">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm sm:text-base lg:text-lg font-bold">
                                          {getInitials(participant.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                    </motion.div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-sm sm:text-base lg:text-lg text-slate-800 dark:text-slate-100 truncate">
                                        {participant.name}
                                      </h4>
                                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate">
                                        {participant.email || "No email provided"}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Joined at {new Date(participant.join_time).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end space-x-2 sm:space-x-3 w-full sm:w-auto">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg px-2 sm:px-3 py-1 text-xs">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        {participant.status}
                                      </Badge>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => awardSpeakingPoint(participant.id)}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg px-3 py-1 text-xs"
                                        disabled={currentMeeting?.status !== "active"}
                                      >
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        {participant.speaking_count}
                                      </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeParticipant(participant.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700 shadow-lg p-2"
                                        disabled={currentMeeting?.status !== "active"}
                                      >
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </motion.div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Participation Tab */}
                <TabsContent value="participation" className="space-y-4 sm:space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-700 shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 rounded-t-lg p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Participation Tracking
                              </CardTitle>
                              <CardDescription className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                                Track speaking points and engagement
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="sort-by" className="text-sm font-medium">
                              Sort by:
                            </Label>
                            <select
                              id="sort-by"
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value as "name" | "points" | "joinTime")}
                              className="px-3 py-1 text-sm border border-blue-200 dark:border-blue-700 rounded-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                            >
                              <option value="points">Speaking Points</option>
                              <option value="name">Name</option>
                              <option value="joinTime">Join Time</option>
                            </select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <AnimatePresence>
                          {participants.length === 0 ? (
                            <motion.div
                              className="text-center py-12 sm:py-16"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                            >
                              <motion.div
                                className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-xl"
                                variants={floatingVariants}
                                animate="animate"
                              >
                                <Award className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                              </motion.div>
                              <h3 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                No participation data yet
                              </h3>
                              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
                                Add participants and start tracking their engagement
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div className="space-y-3 sm:space-y-4" layout>
                              {sortedParticipants.map((participant, index) => (
                                <motion.div
                                  key={participant.id}
                                  layout
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  className="flex items-center justify-between p-4 sm:p-6 border border-purple-100 dark:border-purple-800 rounded-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                    <motion.div
                                      className="relative"
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 shadow-lg">
                                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm sm:text-base lg:text-lg font-bold">
                                          {getInitials(participant.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      {index === 0 && sortBy === "points" && participant.speaking_count > 0 && (
                                        <motion.div
                                          className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 0.5, type: "spring", stiffness: 500, damping: 15 }}
                                        >
                                          <span className="text-xs font-bold text-white">👑</span>
                                        </motion.div>
                                      )}
                                    </motion.div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-sm sm:text-base lg:text-lg text-slate-800 dark:text-slate-100 truncate">
                                        {participant.name}
                                      </h4>
                                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate">
                                        {participant.email || "No email provided"}
                                      </p>
                                      {participant.last_spoke && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          Last spoke: {new Date(participant.last_spoke).toLocaleTimeString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3 flex-shrink-0">
                                    <motion.div
                                      className="text-center"
                                      key={participant.speaking_count}
                                      initial={{ scale: 1.2, opacity: 0.7 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    >
                                      <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                                        {participant.speaking_count}
                                      </div>
                                      <div className="text-xs text-slate-500 dark:text-slate-400">points</div>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => awardSpeakingPoint(participant.id)}
                                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg"
                                        disabled={currentMeeting?.status !== "active"}
                                      >
                                        <Sparkles className="h-4 w-4 mr-1" />
                                        Award Point
                                      </Button>
                                    </motion.div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Exports Tab */}
                <TabsContent value="exports" className="space-y-4 sm:space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-700 shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/50 dark:to-blue-900/50 rounded-t-lg p-4 sm:p-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                            <Download className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                              Export Data
                            </CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                              Download meeting data in Excel format
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50 border border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                              <CardContent className="p-4 sm:p-6 text-center">
                                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">
                                  Attendance Report
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                  Export participant attendance data with join times and status
                                </p>
                                <Button
                                  onClick={exportAttendance}
                                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg w-full"
                                  disabled={participants.length === 0}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Attendance
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                              <CardContent className="p-4 sm:p-6 text-center">
                                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">
                                  Participation Report
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                  Export speaking points and engagement metrics for all participants
                                </p>
                                <Button
                                  onClick={exportParticipation}
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg w-full"
                                  disabled={participants.length === 0}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Participation
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </div>

                        {participants.length === 0 && (
                          <motion.div
                            className="text-center py-8 sm:py-12"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <motion.div
                              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-xl"
                              variants={floatingVariants}
                              animate="animate"
                            >
                              <Download className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                            </motion.div>
                            <h3 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                              No data to export
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
                              Add participants to generate export reports
                            </p>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}
