"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Search, Calendar, Users, Clock, MessageSquare, Trash2, Shield } from "lucide-react"
import { meetingService, participantService, type Meeting, type Participant } from "@/lib/supabase"

interface MeetingHistoryDialogProps {
  userId: string
  onMeetingSelected: (meeting: Meeting, participants: Participant[]) => void
  onMeetingDeleted: (meetingId: string) => Promise<boolean>
}

export function MeetingHistoryDialog({ userId, onMeetingSelected, onMeetingDeleted }: MeetingHistoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadMeetings()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm.trim()) {
      searchMeetings()
    } else {
      loadMeetings()
    }
  }, [searchTerm])

  const loadMeetings = async () => {
    setIsLoading(true)
    try {
      const data = await meetingService.getAllMeetings(userId)
      setMeetings(data)
    } catch (error) {
      console.error("Error loading meetings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchMeetings = async () => {
    setIsLoading(true)
    try {
      const data = await meetingService.searchMeetingsByName(userId, searchTerm)
      setMeetings(data)
    } catch (error) {
      console.error("Error searching meetings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMeetingClick = async (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    try {
      const participantData = await participantService.getParticipantsByMeeting(userId, meeting.id)
      setParticipants(participantData)
    } catch (error) {
      console.error("Error loading participants:", error)
    }
  }

  const handleLoadMeeting = () => {
    if (selectedMeeting && participants) {
      onMeetingSelected(selectedMeeting, participants)
      setIsOpen(false)
      setSelectedMeeting(null)
      setParticipants([])
    }
  }

  const handleDeleteClick = (meeting: Meeting, e: React.MouseEvent) => {
    e.stopPropagation()
    setMeetingToDelete(meeting)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!meetingToDelete) return

    const success = await onMeetingDeleted(meetingToDelete.id)
    if (success) {
      setMeetings((prev) => prev.filter((m) => m.id !== meetingToDelete.id))
      if (selectedMeeting?.id === meetingToDelete.id) {
        setSelectedMeeting(null)
        setParticipants([])
      }
    }
    setDeleteDialogOpen(false)
    setMeetingToDelete(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    return `${diffMins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
      case "ended":
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg"
      case "paused":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg"
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 shadow-lg text-sm w-full sm:w-auto"
            >
              <History className="h-4 w-4 mr-2" />
              Meeting History
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="w-[98vw] sm:w-[95vw] max-w-[1400px] h-[95vh] sm:h-[90vh] max-h-[900px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-blue-200 dark:border-blue-700 p-0 shadow-2xl">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-4 lg:p-6 border-b border-blue-200 dark:border-blue-700 flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50">
              <DialogTitle className="flex items-center space-x-3 text-xl lg:text-2xl">
                <motion.div
                  className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <History className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </motion.div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Your Meeting History
                </span>
              </DialogTitle>
              <DialogDescription className="text-base lg:text-lg text-slate-600 dark:text-slate-300">
                Access your private meeting history and load previous sessions.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden p-4 lg:p-6">
              <div className="space-y-4 lg:space-y-6 h-full">
                {/* Search */}
                <div className="relative flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search your meetings by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-blue-200 dark:border-blue-700 focus:ring-blue-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg"
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 h-[calc(100%-5rem)]">
                  {/* Meetings List */}
                  <div className="space-y-3 lg:space-y-4 h-full">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base lg:text-lg text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Your Private Meetings
                      </h3>
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <ScrollArea className="h-[calc(100%-3rem)]">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <motion.div
                            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                        </div>
                      ) : meetings.length === 0 ? (
                        <motion.div
                          className="text-center py-12"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-base text-slate-600 dark:text-slate-300">No meetings found</p>
                        </motion.div>
                      ) : (
                        <div className="space-y-3 pr-2">
                          <AnimatePresence>
                            {meetings.map((meeting, index) => (
                              <motion.div
                                key={meeting.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -1 }}
                              >
                                <Card
                                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm border ${
                                    selectedMeeting?.id === meeting.id
                                      ? "ring-2 ring-blue-500 border-blue-300 dark:border-blue-600 shadow-lg"
                                      : "border-blue-100 dark:border-blue-800"
                                  }`}
                                  onClick={() => handleMeetingClick(meeting)}
                                >
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                          <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                          <h4 className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-2 flex-1">
                                            {meeting.name}
                                          </h4>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                          <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                                          <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => handleDeleteClick(meeting, e)}
                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </motion.button>
                                        </div>
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="flex items-center space-x-1">
                                          <Calendar className="h-4 w-4 flex-shrink-0" />
                                          <span className="truncate">{formatDate(meeting.start_time)}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                          <Clock className="h-4 w-4 flex-shrink-0" />
                                          <span>{getDuration(meeting.start_time, meeting.end_time)}</span>
                                        </span>
                                      </div>
                                      {meeting.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                          {meeting.description}
                                        </p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Meeting Details */}
                  <div className="space-y-3 lg:space-y-4 h-full">
                    <h3 className="font-bold text-base lg:text-lg text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Meeting Details
                    </h3>
                    <ScrollArea className="h-[calc(100%-3rem)]">
                      <AnimatePresence>
                        {selectedMeeting ? (
                          <motion.div
                            className="space-y-4 pr-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                          >
                            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border border-blue-200 dark:border-blue-700 shadow-lg">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-lg lg:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent line-clamp-2 flex items-center space-x-2">
                                  <Shield className="h-5 w-5 text-blue-600" />
                                  <span>{selectedMeeting.name}</span>
                                </CardTitle>
                                {selectedMeeting.description && (
                                  <CardDescription className="text-base text-slate-600 dark:text-slate-300 line-clamp-3">
                                    {selectedMeeting.description}
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-1">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Started:</span>
                                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm break-words">
                                      {formatDate(selectedMeeting.start_time)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Duration:</span>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">
                                      {getDuration(selectedMeeting.start_time, selectedMeeting.end_time)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                                      Participants:
                                    </span>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">
                                      {participants.length}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                                      Total Points:
                                    </span>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">
                                      {participants.reduce((sum, p) => sum + p.speaking_count, 0)}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                           

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                onClick={handleLoadMeeting}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg text-base py-4"
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Load This Meeting
                              </Button>
                            </motion.div>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="text-center">
                              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="h-8 w-8 text-white" />
                              </div>
                              <p className="text-base lg:text-lg">Select a meeting to view details</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-red-200 dark:border-red-700 mx-2 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-red-600 text-lg">
              <Trash2 className="h-5 w-5" />
              <span>Delete Meeting</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-300 text-base">
              Are you sure you want to delete "{meetingToDelete?.name}"? This action cannot be undone and will
              permanently remove all associated participant data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0">
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white w-full sm:w-auto"
            >
              Delete Meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
