"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, Sparkles } from "lucide-react"
import { meetingService, type Meeting } from "@/lib/supabase"

interface CreateMeetingDialogProps {
  userId: string
  onMeetingCreated: (meeting: Meeting) => void
}

export function CreateMeetingDialog({ userId, onMeetingCreated }: CreateMeetingDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [meetingName, setMeetingName] = useState("")
  const [meetingDescription, setMeetingDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateMeeting = async () => {
    if (!meetingName.trim()) return

    setIsLoading(true)
    try {
      const meeting = await meetingService.createMeeting(
        userId,
        meetingName.trim(),
        meetingDescription.trim() || undefined,
      )

      if (meeting) {
        onMeetingCreated(meeting)
        setMeetingName("")
        setMeetingDescription("")
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Error creating meeting:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg text-sm w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Start New Meeting
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[600px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-blue-200 dark:border-blue-700 mx-2 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-xl lg:text-2xl">
            <motion.div
              className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </motion.div>
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Start New Meeting
            </span>
          </DialogTitle>
          <DialogDescription className="text-base lg:text-lg text-slate-600 dark:text-slate-300">
            Create a new meeting session to track attendance and participation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="meeting-name" className="text-base font-semibold flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Meeting Name *</span>
            </Label>
            <Input
              id="meeting-name"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              placeholder="e.g., Weekly Team Standup"
              className="h-12 text-base border-blue-200 dark:border-blue-700 focus:ring-blue-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="meeting-description" className="text-base font-semibold">
              Description (Optional)
            </Label>
            <Textarea
              id="meeting-description"
              value={meetingDescription}
              onChange={(e) => setMeetingDescription(e.target.value)}
              placeholder="Brief description of the meeting purpose..."
              className="min-h-[100px] text-base border-blue-200 dark:border-blue-700 focus:ring-blue-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm resize-none shadow-lg"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="border-slate-200 dark:border-slate-700 w-full sm:w-auto text-base"
          >
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Button
              onClick={handleCreateMeeting}
              disabled={!meetingName.trim() || isLoading}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg w-full sm:w-auto text-base"
            >
              {isLoading ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Creating..." : "Start Meeting"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
