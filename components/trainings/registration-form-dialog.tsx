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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Sparkles, GraduationCap } from "lucide-react"
import { trainingRegistrationService, type Training } from "@/lib/supabase"

interface RegistrationFormDialogProps {
  training: Training
  onRegistrationSuccess: () => void
}

export function RegistrationFormDialog({ training, onRegistrationSuccess }: RegistrationFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    education_level: "",
    training_level: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.education_level ||
      !formData.training_level
    ) {
      return
    }

    setIsLoading(true)
    try {
      const registration = await trainingRegistrationService.registerParticipant({
        training_id: training.id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        education_level: formData.education_level,
        training_level: formData.training_level as "beginner" | "intermediate" | "advanced",
      })

      if (registration) {
        onRegistrationSuccess()
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          education_level: "",
          training_level: "",
        })
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Error registering participant:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg font-bold">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[600px] bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-slate-800 dark:via-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 mx-2 shadow-2xl">
        <DialogHeader>
          <motion.div
            className="flex items-center justify-center mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <GraduationCap className="h-8 w-8 text-white" />
            </motion.div>
          </motion.div>
          <DialogTitle className="text-2xl text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
            Add New Participant
          </DialogTitle>
          <DialogDescription className="text-center text-slate-600 dark:text-slate-300">
            {training.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-sm font-bold">
                First Name *
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                placeholder="John"
                className="h-11 border-2 border-green-200 dark:border-green-700 focus:ring-green-500"
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-sm font-bold">
                Last Name *
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                placeholder="Doe"
                className="h-11 border-2 border-green-200 dark:border-green-700 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-bold">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john.doe@example.com"
              className="h-11 border-2 border-green-200 dark:border-green-700 focus:ring-green-500"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-bold">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+1 234 567 8900"
              className="h-11 border-2 border-green-200 dark:border-green-700 focus:ring-green-500"
            />
          </div>

          <div>
            <Label htmlFor="education_level" className="text-sm font-bold">
              Education Level *
            </Label>
            <Select value={formData.education_level} onValueChange={(value) => handleChange("education_level", value)}>
              <SelectTrigger className="h-11 border-2 border-green-200 dark:border-green-700">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                <SelectItem value="Engineering Degree">Engineering Degree</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="training_level" className="text-sm font-bold">
              Training Level *
            </Label>
            <Select value={formData.training_level} onValueChange={(value) => handleChange("training_level", value)}>
              <SelectTrigger className="h-11 border-2 border-green-200 dark:border-green-700">
                <SelectValue placeholder="Select training level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">🌱 Beginner</SelectItem>
                <SelectItem value="intermediate">🚀 Intermediate</SelectItem>
                <SelectItem value="advanced">⭐ Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="border-2 border-green-200 dark:border-green-700"
          >
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-initial">
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.first_name ||
                !formData.last_name ||
                !formData.email ||
                !formData.education_level ||
                !formData.training_level ||
                isLoading
              }
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-xl h-11 font-bold"
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
              {isLoading ? "Adding..." : "Add Participant"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
