"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Clock,
  Target,
  Plus,
  UserPlus,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { trainingService, authService, type Training } from "@/lib/supabase"

interface CreateTrainingDialogProps {
  userId: string
  userEmail: string
  onTrainingCreated: (training: Training) => void
}

export function CreateTrainingDialog({ userId, userEmail, onTrainingCreated }: CreateTrainingDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [collaboratorEmail, setCollaboratorEmail] = useState("")
  const [collaborators, setCollaborators] = useState<string[]>([])
  const [emailValidation, setEmailValidation] = useState<{ message: string; isValid: boolean } | null>(null)
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objectives: "",
    duration: "",
    start_date: "",
    end_date: "",
    location: "",
    max_participants: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateAndAddCollaborator = async () => {
    const email = collaboratorEmail.trim().toLowerCase()

    if (!email) {
      setEmailValidation({ message: "Please enter an email address", isValid: false })
      return
    }

    // Check if it's the user's own email
    if (email === userEmail.toLowerCase()) {
      setEmailValidation({ message: "You cannot add yourself as a collaborator", isValid: false })
      return
    }

    // Check if already added
    if (collaborators.includes(email)) {
      setEmailValidation({ message: "This collaborator is already added", isValid: false })
      return
    }

    setIsValidatingEmail(true)
    setEmailValidation(null)

    // Verify email exists in database
    const exists = await authService.checkEmailExists(email)

    setIsValidatingEmail(false)

    if (!exists) {
      setEmailValidation({
        message: "This email is not registered in the system",
        isValid: false,
      })
      return
    }

    // Add to collaborators list
    setCollaborators([...collaborators, email])
    setCollaboratorEmail("")
    setEmailValidation({
      message: "Collaborator added successfully!",
      isValid: true,
    })

    // Clear success message after 2 seconds
    setTimeout(() => setEmailValidation(null), 2000)
  }

  const removeCollaborator = (email: string) => {
    setCollaborators(collaborators.filter((c) => c !== email))
  }

  const handleCreateTraining = async () => {
    if (!formData.title.trim()) return

    setIsLoading(true)
    try {
      const training = await trainingService.createTraining(
        userId,
        {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          objectives: formData.objectives.trim() || undefined,
          duration: formData.duration.trim() || undefined,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          location: formData.location.trim() || undefined,
          max_participants: formData.max_participants ? Number.parseInt(formData.max_participants) : undefined,
        },
        collaborators,
      )

      if (training) {
        onTrainingCreated(training)
        // Reset form
        setFormData({
          title: "",
          description: "",
          objectives: "",
          duration: "",
          start_date: "",
          end_date: "",
          location: "",
          max_participants: "",
        })
        setCollaborators([])
        setCollaboratorEmail("")
        setEmailValidation(null)
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Error creating training:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-white text-purple-600 hover:bg-white/90 shadow-xl text-sm sm:text-base font-bold px-6 py-3 h-auto">
            <Plus className="h-5 w-5 mr-2" />
            Create Training
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[900px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-slate-800 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 mx-2 shadow-2xl">
        <DialogHeader className="space-y-4">
          <motion.div
            className="flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              className="p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <GraduationCap className="h-8 w-8 text-white" />
            </motion.div>
          </motion.div>
          <DialogTitle className="text-3xl text-center bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent font-bold">
            Create New Training Program
          </DialogTitle>
          <DialogDescription className="text-base text-center text-slate-600 dark:text-slate-300">
            Fill in the details and add collaborators to manage this training together
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Collaborators Section */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-3 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-300 dark:border-blue-700"
          >
            <Label className="text-base font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Add Collaborators (Optional)
            </Label>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Collaborators can manage this training, add participants, and complete it. They must have an account in
              the system.
            </p>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="email"
                  value={collaboratorEmail}
                  onChange={(e) => {
                    setCollaboratorEmail(e.target.value)
                    setEmailValidation(null)
                  }}
                  onKeyPress={(e) => e.key === "Enter" && validateAndAddCollaborator()}
                  placeholder="Enter collaborator email"
                  className="h-12 text-base border-2 border-blue-200 dark:border-blue-700 focus:ring-blue-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-xl pr-10"
                />
                {isValidatingEmail && (
                  <motion.div
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </motion.div>
                )}
              </div>
              <Button
                type="button"
                onClick={validateAndAddCollaborator}
                disabled={!collaboratorEmail.trim() || isValidatingEmail}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg h-12 px-6"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <AnimatePresence>
              {emailValidation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    emailValidation.isValid
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  {emailValidation.isValid ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">{emailValidation.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {collaborators.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Collaborators ({collaborators.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {collaborators.map((email) => (
                      <motion.div
                        key={email}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg px-3 py-2 text-sm">
                          <Users className="h-3 w-3 mr-2" />
                          {email}
                          <button
                            type="button"
                            onClick={() => removeCollaborator(email)}
                            className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <Label htmlFor="title" className="text-base font-bold flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              Training Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Advanced React & Next.js Training"
              className="h-14 text-base border-2 border-purple-200 dark:border-purple-700 focus:ring-purple-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-xl"
            />
          </motion.div>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <Label htmlFor="description" className="text-base font-bold mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the training content and benefits..."
              className="min-h-[120px] text-base border-2 border-purple-200 dark:border-purple-700 focus:ring-purple-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm resize-none shadow-lg rounded-xl"
            />
          </motion.div>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Label htmlFor="objectives" className="text-base font-bold flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              Learning Objectives
            </Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => handleChange("objectives", e.target.value)}
              placeholder="What will participants learn from this training?"
              className="min-h-[100px] text-base border-2 border-purple-200 dark:border-purple-700 focus:ring-purple-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm resize-none shadow-lg rounded-xl"
            />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <Label htmlFor="duration" className="text-base font-bold flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Duration
              </Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                placeholder="e.g., 3 days, 20 hours"
                className="h-12 text-base border-2 border-blue-200 dark:border-blue-700 focus:ring-blue-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-xl"
              />
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <Label htmlFor="max_participants" className="text-base font-bold flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                Max Capacity
              </Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => handleChange("max_participants", e.target.value)}
                placeholder="e.g., 30"
                className="h-12 text-base border-2 border-green-200 dark:border-green-700 focus:ring-green-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-xl"
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
              <Label htmlFor="start_date" className="text-base font-bold flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Start Date
              </Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className="h-12 text-base border-2 border-purple-200 dark:border-purple-700 focus:ring-purple-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-xl"
              />
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
              <Label htmlFor="end_date" className="text-base font-bold flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                End Date
              </Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                className="h-12 text-base border-2 border-purple-200 dark:border-purple-700 focus:ring-purple-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-xl"
              />
            </motion.div>
          </div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
            <Label htmlFor="location" className="text-base font-bold flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-pink-600" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="e.g., Online via Zoom, Training Center Paris"
              className="h-12 text-base border-2 border-pink-200 dark:border-pink-700 focus:ring-pink-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-xl"
            />
          </motion.div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-base h-12"
          >
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-initial">
            <Button
              onClick={handleCreateTraining}
              disabled={!formData.title.trim() || isLoading}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-xl text-base h-12 font-bold"
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
              ) : (
                <Sparkles className="h-5 w-5 mr-2" />
              )}
              {isLoading ? "Creating..." : "Create Training"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
