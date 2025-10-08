"use client"

import { useState } from "react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UserPlus, GraduationCap } from "lucide-react"
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
    education_specialty: "",
    education_level: "",
    member_type: "",
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
      !formData.education_specialty ||
      !formData.education_level ||
      !formData.member_type
    ) {
      return
    }

    setIsLoading(true)
    try {
      const registrationPayload: any = {
        training_id: training.id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        education_specialty: formData.education_specialty,
        education_level: formData.education_level,
        member_type: formData.member_type as "adherent" | "actif",
      }
      if (formData.training_level) {
        registrationPayload.training_level = formData.training_level as "beginner" | "intermediate" | "advanced"
      }
      const registration = await trainingRegistrationService.registerParticipant(registrationPayload)

      if (registration) {
        onRegistrationSuccess()
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          education_specialty: "",
          education_level: "",
          member_type: "",
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
        <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md flex items-center">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-600 rounded-full">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl sm:text-2xl text-center font-semibold text-gray-900 dark:text-white">
            Add New Participant
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            {training.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                First Name *
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                placeholder="John"
                className="mt-1 h-10 border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Last Name *
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                placeholder="Doe"
                className="mt-1 h-10 border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john.doe@example.com"
              className="mt-1 h-10 border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+216 12 345 678"
              className="mt-1 h-10 border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <Label htmlFor="education_specialty" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Education Specialty *
            </Label>
            <Select value={formData.education_specialty} onValueChange={(value) => handleChange("education_specialty", value)}>
              <SelectTrigger className="mt-1 h-10 border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500">
                <SelectValue placeholder="Select education specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="licence_science_info">Licence Science Info</SelectItem>
                <SelectItem value="licence_eea">Licence EEA</SelectItem>
                <SelectItem value="licence_math_applique">Licence Math Appliqué</SelectItem>
                <SelectItem value="licence_systeme_embarque">Licence Système Embarqué</SelectItem>
                <SelectItem value="licence_tic">Licence TIC</SelectItem>
                <SelectItem value="cpi">CPI</SelectItem>
                <SelectItem value="ing_info">Ing Info</SelectItem>
                <SelectItem value="ing_micro_electronique">Ing Micro Electronique</SelectItem>
                <SelectItem value="master_recherche_data_science">Master Recherche Data Science</SelectItem>
                <SelectItem value="master_recherche_gl">Master Recherche GL</SelectItem>
                <SelectItem value="master_pro_data_science">Master Pro Data Science</SelectItem>
                <SelectItem value="master_pro_gl">Master Pro GL</SelectItem>
                <SelectItem value="master_recherche_electronique">Master Recherche Électronique</SelectItem>
                <SelectItem value="master_pro_electronique">Master Pro Électronique</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="education_level" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Education Level *
            </Label>
            <Select value={formData.education_level} onValueChange={(value) => handleChange("education_level", value)}>
              <SelectTrigger className="mt-1 h-10 border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Member Type *
            </Label>
            <RadioGroup value={formData.member_type} onValueChange={(value) => handleChange("member_type", value)} className="mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="adherent" id="adherent" className="border-gray-400 text-green-600" />
                  <Label htmlFor="adherent" className="cursor-pointer text-sm text-gray-700 dark:text-gray-200">
                    Adherent Member
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="actif" id="actif" className="border-gray-400 text-green-600" />
                  <Label htmlFor="actif" className="cursor-pointer text-sm text-gray-700 dark:text-gray-200">
                    Active Member
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="training_level" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Training Level
            </Label>
            <Select value={formData.training_level} onValueChange={(value) => handleChange("training_level", value)}>
              <SelectTrigger className="mt-1 h-10 border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500">
                <SelectValue placeholder="Select training level (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !formData.first_name ||
              !formData.last_name ||
              !formData.email ||
              !formData.education_specialty ||
              !formData.education_level ||
              !formData.member_type ||
              isLoading
            }
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold h-10"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <UserPlus className="h-5 w-5 mr-2" />
            )}
            {isLoading ? "Adding..." : "Add Participant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}