"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Users,
  Mail,
  Phone,
  GraduationCap,
  User,
  CheckCircle,
  Star,
  Rocket,
  Trash2,
  Search,
  Award,
  Calendar,
} from "lucide-react"
import { trainingRegistrationService, type Training, type TrainingRegistration } from "@/lib/supabase"

interface TrainingParticipantsViewProps {
  training: Training
  onUpdate?: () => void
}

const levelConfig = {
  beginner: {
    label: "Beginner",
    icon: Rocket,
    color: "bg-green-600",
    borderColor: "border-green-200 dark:border-green-700",
    textColor: "text-green-700 dark:text-green-300",
  },
  intermediate: {
    label: "Intermediate",
    icon: Star,
    color: "bg-blue-600",
    borderColor: "border-blue-200 dark:border-blue-700",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  advanced: {
    label: "Advanced",
    icon: Award,
    color: "bg-purple-600",
    borderColor: "border-purple-200 dark:border-purple-700",
    textColor: "text-purple-700 dark:text-purple-300",
  },
}

const educationSpecialtyLabels: Record<string, string> = {
  licence_science_info: "Licence Science Info",
  licence_eea: "Licence EEA",
  licence_math_applique: "Licence Math Appliqué",
  licence_systeme_embarque: "Licence Système Embarqué",
  licence_tic: "Licence TIC",
  cpi: "CPI",
  ing_info: "Ing Info",
  ing_micro_electronique: "Ing Micro Électronique",
  master_recherche_data_science: "Master Recherche Data Science",
  master_recherche_gl: "Master Recherche GL",
  master_pro_data_science: "Master Pro Data Science",
  master_pro_gl: "Master Pro GL",
  master_recherche_electronique: "Master Recherche Électronique",
  master_pro_electronique: "Master Pro Électronique",
  other: "Other",
}

const memberTypeConfig = {
  adherent: {
    label: "Adherent Member",
    color: "bg-blue-600 text-white",
  },
  actif: {
    label: "Active Member",
    color: "bg-purple-600 text-white",
  },
}

export function TrainingParticipantsView({ training, onUpdate }: TrainingParticipantsViewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [participants, setParticipants] = useState<TrainingRegistration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadParticipants()
    }
  }, [isOpen])

  const loadParticipants = async () => {
    setIsLoading(true)
    try {
      const data = await trainingRegistrationService.getTrainingRegistrations(training.id)
      setParticipants(data)
    } catch (error) {
      console.error("Error loading participants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteParticipant = async (participantId: string) => {
    const success = await trainingRegistrationService.deleteRegistration(participantId)
    if (success) {
      await loadParticipants()
      onUpdate?.()
    }
  }

  const filteredParticipants = participants.filter(
    (p) =>
      p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const groupedParticipants = {
    beginner: filteredParticipants.filter((p) => p.training_level === "beginner"),
    intermediate: filteredParticipants.filter((p) => p.training_level === "intermediate"),
    advanced: filteredParticipants.filter((p) => p.training_level === "advanced"),
  }

  const ParticipantCard = ({ participant }: { participant: TrainingRegistration }) => {
    const levelInfo = participant.training_level ? levelConfig[participant.training_level] : levelConfig.beginner
    const memberInfo = memberTypeConfig[participant.member_type as keyof typeof memberTypeConfig]

    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className={`w-8 sm:w-10 h-8 sm:h-10 ${levelInfo.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <User className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                  {participant.first_name} {participant.last_name}
                </h4>
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                  {memberInfo && (
                    <Badge className={`${memberInfo.color} font-medium text-xs px-1 sm:px-2 py-0.5 sm:py-1`}>
                      {memberInfo.label}
                    </Badge>
                  )}
                  <Badge className={`${levelInfo.color} text-white font-medium text-xs px-1 sm:px-2 py-0.5 sm:py-1`}>
                    {levelInfo.label}
                  </Badge>
                  <Badge className="bg-green-600 text-white border-0 text-xs px-1 sm:px-2 py-0.5 sm:py-1">
                    <CheckCircle className="h-2 sm:h-3 w-2 sm:w-3 mr-0.5 sm:mr-1" />
                    Enrolled
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteParticipant(participant.id)}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 sm:h-8 w-6 sm:w-8 p-0 flex-shrink-0"
            >
              <Trash2 className="h-3 sm:h-4 w-3 sm:w-4" />
            </Button>
          </div>

          {/* Contact & Education - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-4">
            {/* Contact Information */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Contact Information
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-sm">
                <div className="w-5 sm:w-7 h-5 sm:h-7 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0">
                  <Mail className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 truncate">{participant.email}</span>
              </div>
              {participant.phone && (
                <div className="flex items-center gap-1 sm:gap-2 text-sm">
                  <div className="w-5 sm:w-7 h-5 sm:h-7 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center flex-shrink-0">
                    <Phone className="h-3 sm:h-4 w-3 sm:w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{participant.phone}</span>
                </div>
              )}
            </div>

            {/* Education Details */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Education Details
              </div>
              <div className="flex items-start gap-1 sm:gap-2 text-sm">
                <div className="w-5 sm:w-7 h-5 sm:h-7 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0 sm:mt-0.5">
                  <GraduationCap className="h-3 sm:h-4 w-3 sm:w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {educationSpecialtyLabels[participant.education_specialty] || participant.education_specialty}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 flex items-center gap-0.5 sm:gap-1">
                    <Award className="h-2 sm:h-3 w-2 sm:w-3" />
                    Education Level: <span className="font-medium">{participant.education_level}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Registration Date */}
          <div className="pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              <span className="font-medium">
                Enrolled on{" "}
                {new Date(participant.registration_date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(participant.registration_date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-md flex items-center text-sm sm:text-base"
        >
          <Users className="h-4 w-4 mr-1 sm:mr-2" />
          View Participants ({participants.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl h-[75vh] sm:h-[85vh] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden rounded-lg p-0">
        <DialogHeader className="px-2 sm:px-4 pt-2 sm:pt-4 pb-2 sm:pb-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-2 bg-blue-600 rounded">
                <Users className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Training Participants
                </DialogTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">{training.title}</p>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white border-0 text-xs sm:text-sm px-1.5 sm:px-3 py-0.5 sm:py-1 w-fit">
              {participants.length} Total
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="mt-2 sm:mt-4 relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
            <Input
              placeholder="Search participants by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-2 sm:p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 sm:w-8 h-6 sm:h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mx-auto w-8 sm:w-12 h-8 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                  {searchTerm ? (
                    <Search className="h-4 sm:h-6 w-4 sm:w-6 text-gray-400" />
                  ) : (
                    <Users className="h-4 sm:h-6 w-4 sm:w-6 text-gray-400" />
                  )}
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                  {searchTerm ? "No participants found" : "No participants yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  {searchTerm ? "Try adjusting your search terms" : "Participants will appear here once they enroll"}
                </p>
              </div>
            </div>
          ) : training.status === "completed" ? (
            <Tabs defaultValue="all" className="h-full flex flex-col">
              <TabsList className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-4 w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 mb-2 sm:mb-4 p-0.5 sm:p-1 rounded-md space-x-1 sm:space-x-0">
                <TabsTrigger
                  value="all"
                  className="flex-1 text-xs sm:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-blue-300 px-1 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap"
                >
                  All ({filteredParticipants.length})
                </TabsTrigger>
                {Object.entries(groupedParticipants).map(([level, parts]) => {
                  const config = levelConfig[level as keyof typeof levelConfig]
                  return (
                    <TabsTrigger
                      key={level}
                      value={level}
                      className="flex-1 text-xs sm:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-blue-300 px-1 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap"
                    >
                      {config.label} ({parts.length})
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-full pr-1 sm:pr-2">
                  <div className="space-y-2 sm:space-y-4">
                    {filteredParticipants.map((participant) => (
                      <ParticipantCard key={participant.id} participant={participant} />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {Object.entries(groupedParticipants).map(([level, parts]) => {
                const config = levelConfig[level as keyof typeof levelConfig]
                return (
                  <TabsContent key={level} value={level} className="flex-1 overflow-hidden mt-0">
                    {parts.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 ${config.color}`}>
                            <config.icon className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                          </div>
                          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-1">
                            No {config.label.toLowerCase()} participants
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-full pr-1 sm:pr-2">
                        <div className="space-y-2 sm:space-y-4">
                          {parts.map((participant) => (
                            <ParticipantCard key={participant.id} participant={participant} />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
          ) : (
            <ScrollArea className="h-full pr-1 sm:pr-2">
              <div className="space-y-2 sm:space-y-4">
                {filteredParticipants.map((participant) => (
                  <ParticipantCard key={participant.id} participant={participant} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}