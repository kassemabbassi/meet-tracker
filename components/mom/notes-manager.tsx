"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Target, Zap, CheckCircle, AlertTriangle, Clock, User, Mail, Trash2, Send } from "lucide-react"
import { notesService, gmailService } from "@/lib/meeting-service"
import type { MeetingNote, Meeting, Participant } from "@/lib/supabase-client"

interface NotesManagerProps {
  meeting: Meeting
  participants: Participant[]
  userEmail: string
}

export function NotesManager({ meeting, participants, userEmail }: NotesManagerProps) {
  const [notes, setNotes] = useState<MeetingNote[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  // Form state
  const [noteType, setNoteType] = useState<MeetingNote["note_type"]>("general")
  const [content, setContent] = useState("")
  const [assignedToEmail, setAssignedToEmail] = useState("")
  const [assignedToName, setAssignedToName] = useState("")
  const [priority, setPriority] = useState<MeetingNote["priority"]>("medium")
  const [dueDate, setDueDate] = useState("")

  // Email form state
  const [additionalEmails, setAdditionalEmails] = useState("")

  useEffect(() => {
    loadNotes()
  }, [meeting.id])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const data = await notesService.getNotesByMeeting(meeting.id)
      setNotes(data)
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const note = await notesService.addNote(
        meeting.id,
        noteType,
        content.trim(),
        assignedToEmail.trim() || undefined,
        assignedToName.trim() || undefined,
        priority,
        dueDate || undefined,
      )

      if (note) {
        setNotes((prev) => [...prev, note])
        resetForm()
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    const success = await notesService.deleteNote(noteId)
    if (success) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    }
  }

  const handleSendMoM = async () => {
    setEmailLoading(true)
    try {
      // Send full MoM to meeting leader
      const { html: leaderHtml, text: leaderText } = gmailService.generateMomEmailContent(
        meeting.name,
        meeting.start_time,
        notes,
        participants,
        false,
      )

      await gmailService.sendEmail({
        to: userEmail,
        subject: `Minutes of Meeting: ${meeting.name}`,
        htmlContent: leaderHtml,
        textContent: leaderText,
      })

      // Send to additional emails if provided
      if (additionalEmails.trim()) {
        const emails = additionalEmails
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email)

        for (const email of emails) {
          await gmailService.sendEmail({
            to: email,
            subject: `Minutes of Meeting: ${meeting.name}`,
            htmlContent: leaderHtml,
            textContent: leaderText,
          })
        }
      }

      // Send personalized action items to assigned people
      const actionNotes = notes.filter((note) => note.note_type === "action" && note.assigned_to_email)
      const uniqueAssignees = [...new Set(actionNotes.map((note) => note.assigned_to_email))]

      for (const assigneeEmail of uniqueAssignees) {
        if (assigneeEmail) {
          const { html: actionHtml, text: actionText } = gmailService.generateMomEmailContent(
            meeting.name,
            meeting.start_time,
            notes,
            participants,
            true,
            assigneeEmail,
          )

          await gmailService.sendEmail({
            to: assigneeEmail,
            subject: `Action Items from Meeting: ${meeting.name}`,
            htmlContent: actionHtml,
            textContent: actionText,
          })
        }
      }

      setIsEmailDialogOpen(false)
      setAdditionalEmails("")
    } catch (error) {
      console.error("Error sending MoM:", error)
    } finally {
      setEmailLoading(false)
    }
  }

  const resetForm = () => {
    setNoteType("general")
    setContent("")
    setAssignedToEmail("")
    setAssignedToName("")
    setPriority("medium")
    setDueDate("")
  }

  const getTypeIcon = (type: MeetingNote["note_type"]) => {
    const icons = {
      general: FileText,
      action: Zap,
      objective: Target,
      decision: CheckCircle,
      issue: AlertTriangle,
    }
    return icons[type]
  }

  const getTypeColor = (type: MeetingNote["note_type"]) => {
    const colors = {
      general: "from-blue-500 to-cyan-500",
      action: "from-red-500 to-pink-500",
      objective: "from-orange-500 to-yellow-500",
      decision: "from-green-500 to-emerald-500",
      issue: "from-purple-500 to-indigo-500",
    }
    return colors[type]
  }

  const getPriorityColor = (priority: MeetingNote["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      medium: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
      urgent: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
    }
    return colors[priority]
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-700 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-t-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Minutes of Meeting
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Take notes and manage action items
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-3">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-blue-200 dark:border-blue-700 mx-2 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-xl">
                      <Plus className="h-5 w-5 text-blue-600" />
                      <span>Add Meeting Note</span>
                    </DialogTitle>
                    <DialogDescription>Create a new note for the meeting minutes</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="note-type">Note Type</Label>
                        <Select
                          value={noteType}
                          onValueChange={(value: MeetingNote["note_type"]) => setNoteType(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">📝 General Note</SelectItem>
                            <SelectItem value="action">⚡ Action Item</SelectItem>
                            <SelectItem value="objective">🎯 Objective</SelectItem>
                            <SelectItem value="decision">✅ Decision</SelectItem>
                            <SelectItem value="issue">⚠️ Issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={priority} onValueChange={(value: MeetingNote["priority"]) => setPriority(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter note content..."
                        className="min-h-[120px] resize-none"
                      />
                    </div>

                    {noteType === "action" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                        <div className="space-y-2">
                          <Label htmlFor="assigned-name">Assigned To (Name)</Label>
                          <Input
                            id="assigned-name"
                            value={assignedToName}
                            onChange={(e) => setAssignedToName(e.target.value)}
                            placeholder="Person's name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="assigned-email">Assigned To (Email)</Label>
                          <Input
                            id="assigned-email"
                            type="email"
                            value={assignedToEmail}
                            onChange={(e) => setAssignedToEmail(e.target.value)}
                            placeholder="person@example.com"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="due-date">Due Date (Optional)</Label>
                          <Input
                            id="due-date"
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddNote} disabled={isLoading || !content.trim()}>
                      {isLoading ? "Adding..." : "Add Note"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {notes.length > 0 && (
                <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send MoM
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-green-200 dark:border-green-700 mx-2">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2 text-xl">
                        <Send className="h-5 w-5 text-green-600" />
                        <span>Send Minutes of Meeting</span>
                      </DialogTitle>
                      <DialogDescription>
                        Send the complete MoM to yourself and optionally to additional recipients. Action items will be
                        sent individually to assigned people.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="additional-emails">Additional Recipients (Optional)</Label>
                        <Textarea
                          id="additional-emails"
                          value={additionalEmails}
                          onChange={(e) => setAdditionalEmails(e.target.value)}
                          placeholder="email1@example.com, email2@example.com"
                          className="min-h-[80px] resize-none"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Separate multiple emails with commas
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)} disabled={emailLoading}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendMoM} disabled={emailLoading}>
                        {emailLoading ? (
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {emailLoading ? "Sending..." : "Send MoM"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
              </div>
            ) : notes.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.div
                  className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-xl"
                  animate={{
                    y: [-10, 10, -10],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <FileText className="h-12 w-12 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  No notes yet
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Start taking meeting notes to create your Minutes of Meeting
                </p>
              </motion.div>
            ) : (
              <motion.div className="space-y-4" layout>
                {notes.map((note, index) => {
                  const TypeIcon = getTypeIcon(note.note_type)
                  return (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between space-x-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <motion.div
                            className={`p-3 bg-gradient-to-br ${getTypeColor(note.note_type)} rounded-lg shadow-lg`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <TypeIcon className="h-5 w-5 text-white" />
                          </motion.div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-3">
                              <Badge
                                variant="outline"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg"
                              >
                                {note.note_type.charAt(0).toUpperCase() + note.note_type.slice(1)}
                              </Badge>
                              <Badge className={getPriorityColor(note.priority)}>
                                {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-slate-800 dark:text-slate-100 text-base leading-relaxed">
                              {note.content}
                            </p>
                            {note.assigned_to_name && (
                              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4" />
                                  <span>Assigned to: {note.assigned_to_name}</span>
                                </div>
                                {note.assigned_to_email && (
                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{note.assigned_to_email}</span>
                                  </div>
                                )}
                                {note.due_date && (
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Due: {new Date(note.due_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Added on {new Date(note.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
