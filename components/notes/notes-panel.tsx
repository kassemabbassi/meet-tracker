"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  ArrowRight,
  Save,
} from "lucide-react"
import { notesService, type MeetingNote, type Meeting, type AppUser } from "@/lib/supabase"

interface NotesPanelProps {
  user: AppUser
  meeting: Meeting
}

export function NotesPanel({ user, meeting }: NotesPanelProps) {
  const [notes, setNotes] = useState<MeetingNote[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedNote, setSelectedNote] = useState<MeetingNote | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [noteType, setNoteType] = useState<MeetingNote["note_type"]>("general")
  const [priority, setPriority] = useState<MeetingNote["priority"]>("medium")

  useEffect(() => {
    loadNotes()
  }, [meeting.id])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const data = await notesService.getNotesByMeeting(user.id, meeting.id)
      setNotes(data)
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return

    setIsLoading(true)
    try {
      const note = await notesService.createNote(user.id, meeting.id, title.trim(), content.trim(), noteType, priority)

      if (note) {
        setNotes((prev) => [note, ...prev])
        resetForm()
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditNote = async () => {
    if (!selectedNote || !title.trim() || !content.trim()) return

    setIsLoading(true)
    try {
      const success = await notesService.updateNote(user.id, selectedNote.id, {
        title: title.trim(),
        content: content.trim(),
        note_type: noteType,
        priority,
      })

      if (success) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === selectedNote.id
              ? { ...n, title: title.trim(), content: content.trim(), note_type: noteType, priority }
              : n,
          ),
        )
        resetForm()
        setIsEditDialogOpen(false)
        setSelectedNote(null)
      }
    } catch (error) {
      console.error("Error updating note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    setIsLoading(true)
    try {
      const success = await notesService.deleteNote(user.id, noteId)
      if (success) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId))
      }
    } catch (error) {
      console.error("Error deleting note:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (note: MeetingNote) => {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
    setNoteType(note.note_type)
    setPriority(note.priority)
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setNoteType("general")
    setPriority("medium")
  }

  const getTypeIcon = (type: MeetingNote["note_type"]) => {
    const icons = {
      general: FileText,
      action: CheckCircle,
      decision: Target,
      idea: Lightbulb,
      issue: AlertCircle,
      "follow-up": ArrowRight,
    }
    return icons[type]
  }

  const getTypeColor = (type: MeetingNote["note_type"]) => {
    const colors = {
      general: "from-blue-500 to-cyan-500",
      action: "from-green-500 to-emerald-500",
      decision: "from-purple-500 to-violet-500",
      idea: "from-yellow-500 to-orange-500",
      issue: "from-red-500 to-pink-500",
      "follow-up": "from-indigo-500 to-blue-500",
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

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-700 shadow-xl h-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-t-lg flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meeting Notes
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </CardDescription>
            </div>
          </div>
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
                <DialogDescription>Create a new note for the meeting</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="note-type">Note Type</Label>
                    <Select value={noteType} onValueChange={(value: MeetingNote["note_type"]) => setNoteType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">📝 General</SelectItem>
                        <SelectItem value="action">✅ Action Item</SelectItem>
                        <SelectItem value="decision">🎯 Decision</SelectItem>
                        <SelectItem value="idea">💡 Idea</SelectItem>
                        <SelectItem value="issue">⚠️ Issue</SelectItem>
                        <SelectItem value="follow-up">➡️ Follow-up</SelectItem>
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
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title..."
                    className="border-blue-200 dark:border-blue-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter note content..."
                    className="min-h-[150px] resize-none border-blue-200 dark:border-blue-700"
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote} disabled={isLoading || !title.trim() || !content.trim()}>
                  {isLoading ? "Adding..." : "Add Note"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          <AnimatePresence>
            {isLoading && notes.length === 0 ? (
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
                  variants={floatingVariants}
                  animate="animate"
                >
                  <FileText className="h-12 w-12 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  No notes yet
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Start adding notes to document this meeting
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
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between space-x-4">
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                          <motion.div
                            className={`p-3 bg-gradient-to-br ${getTypeColor(note.note_type)} rounded-lg shadow-lg flex-shrink-0`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <TypeIcon className="h-5 w-5 text-white" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
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
                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 break-words">
                              {note.title}
                            </h4>
                            <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
                              {note.content}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(note.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditDialog(note)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-blue-200 dark:border-blue-700 mx-2 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <Edit className="h-5 w-5 text-blue-600" />
              <span>Edit Note</span>
            </DialogTitle>
            <DialogDescription>Update the note details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-note-type">Note Type</Label>
                <Select value={noteType} onValueChange={(value: MeetingNote["note_type"]) => setNoteType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">📝 General</SelectItem>
                    <SelectItem value="action">✅ Action Item</SelectItem>
                    <SelectItem value="decision">🎯 Decision</SelectItem>
                    <SelectItem value="idea">💡 Idea</SelectItem>
                    <SelectItem value="issue">⚠️ Issue</SelectItem>
                    <SelectItem value="follow-up">➡️ Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
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
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="border-blue-200 dark:border-blue-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter note content..."
                className="min-h-[150px] resize-none border-blue-200 dark:border-blue-700"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                resetForm()
                setSelectedNote(null)
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEditNote} disabled={isLoading || !title.trim() || !content.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
