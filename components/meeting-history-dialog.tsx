"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { History, Calendar, Trash2, PlayCircle, MousePointer2 } from "lucide-react"
import { meetingService, participantService, type Meeting, type Participant } from "@/lib/supabase"

interface MeetingHistoryDialogProps {
  userId: string
  onMeetingSelected: (meeting: Meeting, participants: Participant[]) => void
  onMeetingDeleted: (meetingId: string) => Promise<boolean>
}

export function MeetingHistoryDialog({ userId, onMeetingSelected, onMeetingDeleted }: MeetingHistoryDialogProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [doubleClickLoading, setDoubleClickLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMeetings()
    }
  }, [isOpen])

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

  const handleSelectMeeting = async (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    const meetingParticipants = await participantService.getParticipantsByMeeting(userId, meeting.id)
    setParticipants(meetingParticipants)
  }

  const handleDoubleClick = async (meeting: Meeting) => {
    setDoubleClickLoading(true)
    try {
      const meetingParticipants = await participantService.getParticipantsByMeeting(userId, meeting.id)
      onMeetingSelected(meeting, meetingParticipants)
      setIsOpen(false)
      setSelectedMeeting(null)
    } catch (error) {
      console.error("Error loading meeting:", error)
    } finally {
      setDoubleClickLoading(false)
    }
  }

  const handleLoadMeeting = () => {
    if (selectedMeeting) {
      onMeetingSelected(selectedMeeting, participants)
      setIsOpen(false)
      setSelectedMeeting(null)
    }
  }

  const handleDeleteMeeting = async (meetingId: string) => {
    const success = await onMeetingDeleted(meetingId)
    if (success) {
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId))
      if (selectedMeeting?.id === meetingId) {
        setSelectedMeeting(null)
        setParticipants([])
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400"
          >
            <History className="h-4 w-4 mr-2" />
            Meeting History
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-blue-200 dark:border-blue-700 flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-blue-200 dark:border-blue-700 flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <History className="h-6 w-6 text-blue-600" />
            <span>Meeting History</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            View and manage your past meetings ({meetings.length} {meetings.length === 1 ? "meeting" : "meetings"})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-6">
          {/* Meetings List */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Your Meetings</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center space-x-2">
                <MousePointer2 className="h-4 w-4" />
                <span>Double-click to load instantly</span>
              </p>
            </div>
            <ScrollArea className="flex-1 pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">No meetings yet</h3>
                  <p className="text-slate-500 dark:text-slate-400">Create your first meeting to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.map((meeting, index) => (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => handleSelectMeeting(meeting)}
                      onDoubleClick={() => handleDoubleClick(meeting)}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-300 group ${
                        selectedMeeting?.id === meeting.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-start justify-between space-x-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate flex items-center space-x-2">
                            <span className="truncate">{meeting.name}</span>
                            {selectedMeeting?.id === meeting.id && (
                              <Badge className="bg-blue-500 text-white text-xs">Selected</Badge>
                            )}
                          </h4>
                          {meeting.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                              {meeting.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-3 mt-2">
                            <Badge
                              className={
                                meeting.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              }
                            >
                              {meeting.status}
                            </Badge>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(meeting.start_time).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteMeeting(meeting.id)
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors z-10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 dark:bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg">
                        <MousePointer2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                          Double-click to load
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Meeting Details */}
          <div className="flex-1 overflow-hidden flex flex-col border-t lg:border-t-0 lg:border-l border-blue-200 dark:border-blue-700 pt-6 lg:pt-0 lg:pl-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Meeting Details</h3>
            </div>
            <ScrollArea className="flex-1 pr-4">
              {selectedMeeting ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                    <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                      {selectedMeeting.name}
                    </h4>
                    {selectedMeeting.description && (
                      <p className="text-slate-600 dark:text-slate-300 mb-4">{selectedMeeting.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-600 dark:text-slate-400">Status:</span>
                        <Badge className="ml-2">{selectedMeeting.status}</Badge>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600 dark:text-slate-400">Started:</span>
                        <span className="ml-2 text-slate-800 dark:text-slate-100">
                          {new Date(selectedMeeting.start_time).toLocaleString()}
                        </span>
                      </div>
                      {selectedMeeting.end_time && (
                        <div>
                          <span className="font-medium text-slate-600 dark:text-slate-400">Ended:</span>
                          <span className="ml-2 text-slate-800 dark:text-slate-100">
                            {new Date(selectedMeeting.end_time).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                      Participants ({participants.length})
                    </h5>
                    {participants.length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-8">No participants</p>
                    ) : (
                      <div className="space-y-2">
                        {participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800 dark:text-slate-100">{participant.name}</span>
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                {participant.speaking_count} points
                              </Badge>
                            </div>
                            {participant.email && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{participant.email}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-4">
                    <Button
                      onClick={handleLoadMeeting}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                    >
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Load This Meeting
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Calendar className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Select a meeting</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Click on a meeting to view its details
                      <br />
                      or double-click to load it instantly
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {doubleClickLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl">
              <motion.div
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">Loading meeting...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
