"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  BookOpen,
  User,
  CheckCircle,
  Star,
  Rocket,
  Sparkles,
  Trash2,
  Search,
  Award,
  GraduationCap,
  UserCircle,
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
    icon: Sparkles,
    color: "from-green-400 to-emerald-500",
    avatarColor: "bg-gradient-to-br from-green-400 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    borderColor: "border-green-200 dark:border-green-700",
    textColor: "text-green-700 dark:text-green-300",
    emoji: "🌱",
  },
  intermediate: {
    label: "Intermediate",
    icon: Rocket,
    color: "from-blue-400 to-cyan-500",
    avatarColor: "bg-gradient-to-br from-blue-400 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    borderColor: "border-blue-200 dark:border-blue-700",
    textColor: "text-blue-700 dark:text-blue-300",
    emoji: "🚀",
  },
  advanced: {
    label: "Advanced",
    icon: Star,
    color: "from-purple-400 to-pink-500",
    avatarColor: "bg-gradient-to-br from-purple-400 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    borderColor: "border-purple-200 dark:border-purple-700",
    textColor: "text-purple-700 dark:text-purple-300",
    emoji: "⭐",
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
  other: "Autre",
}

const memberTypeConfig = {
  adherent: {
    label: "Adherent Member",
    color: "bg-blue-500 text-white",
    icon: "👥",
    gradient: "from-blue-400 to-blue-600",
  },
  actif: {
    label: "Active Member",
    color: "bg-purple-500 text-white",
    icon: "⚡",
    gradient: "from-purple-400 to-purple-600",
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

  const ParticipantCard = ({ participant, index }: { participant: TrainingRegistration; index: number }) => {
    const levelInfo = participant.training_level ? levelConfig[participant.training_level] : levelConfig.beginner
    const memberInfo = memberTypeConfig[participant.member_type as keyof typeof memberTypeConfig]
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-12 h-12 ${levelInfo.avatarColor} rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                    {participant.first_name} {participant.last_name}
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {memberInfo && (
                      <Badge className={`${memberInfo.color} font-medium text-xs px-2 py-1`}>
                        {memberInfo.label}
                      </Badge>
                    )}
                    <Badge className={`bg-gradient-to-r ${levelInfo.color} text-white font-medium text-xs px-2 py-1`}>
                      {levelInfo.emoji} {levelInfo.label}
                    </Badge>
                    <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enrolled
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteParticipant(participant.id)}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Contact & Education - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Contact Information
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 truncate">{participant.email}</span>
                </div>
                {participant.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{participant.phone}</span>
                  </div>
                )}
              </div>

              {/* Education Details */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Education Details
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {educationSpecialtyLabels[participant.education_specialty] || participant.education_specialty}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Education Level: <span className="font-medium">{participant.education_level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Registration Date */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
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
      </motion.div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Users className="h-4 w-4 mr-2" />
          View Participants ({participants.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] sm:h-[85vh] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  Training Participants
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{training.title}</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-sm px-3 py-1 w-fit">
              {participants.length} Total
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search participants by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-sm border border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  {searchTerm ? (
                    <Search className="h-8 w-8 text-gray-400" />
                  ) : (
                    <Users className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {searchTerm ? "No participants found" : "No participants yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm ? "Try adjusting your search terms" : "Participants will appear here once they enroll"}
                </p>
              </div>
            </div>
          ) : training.status === "completed" ? (
            <Tabs defaultValue="all" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mb-4 p-1 rounded-lg">
                <TabsTrigger
                  value="all"
                  className="text-xs sm:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                >
                  All ({filteredParticipants.length})
                </TabsTrigger>
                {Object.entries(groupedParticipants).map(([level, parts]) => {
                  const config = levelConfig[level as keyof typeof levelConfig]
                  return (
                    <TabsTrigger
                      key={level}
                      value={level}
                      className="text-xs sm:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                    >
                      <span className="hidden sm:inline mr-1">{config.emoji}</span>
                      {config.label} ({parts.length})
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-full pr-2 sm:pr-4">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {filteredParticipants.map((participant, index) => (
                        <ParticipantCard key={participant.id} participant={participant} index={index} />
                      ))}
                    </AnimatePresence>
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
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${config.avatarColor}`}>
                            <config.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No {config.label.toLowerCase()} participants
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-full pr-2 sm:pr-4">
                        <div className="space-y-4">
                          <AnimatePresence>
                            {parts.map((participant, index) => (
                              <ParticipantCard key={participant.id} participant={participant} index={index} />
                            ))}
                          </AnimatePresence>
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
          ) : (
            <ScrollArea className="h-full pr-2 sm:pr-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredParticipants.map((participant, index) => (
                    <ParticipantCard key={participant.id} participant={participant} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}