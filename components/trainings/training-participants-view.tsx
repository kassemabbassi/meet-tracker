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
    label: "Beginners",
    icon: Sparkles,
    color: "from-green-400 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    borderColor: "border-green-200 dark:border-green-700",
    textColor: "text-green-700 dark:text-green-300",
    emoji: "🌱",
  },
  intermediate: {
    label: "Intermediate",
    icon: Rocket,
    color: "from-blue-400 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    borderColor: "border-blue-200 dark:border-blue-700",
    textColor: "text-blue-700 dark:text-blue-300",
    emoji: "🚀",
  },
  advanced: {
    label: "Advanced",
    icon: Star,
    color: "from-purple-400 to-pink-500",
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
    const levelInfo = participant.training_level ? levelConfig[participant.training_level] : null
    const memberInfo = memberTypeConfig[participant.member_type as keyof typeof memberTypeConfig]
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.01, y: -2 }}
      >
        <Card className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardContent className="p-6 relative">
            {/* Header Section with Name and Actions */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-br ${memberInfo.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <User className="h-8 w-8 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-2">
                    {participant.first_name} {participant.last_name}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${memberInfo.color} font-semibold shadow-md px-3 py-1`}>
                      <span className="mr-1.5">{memberInfo.icon}</span>
                      {memberInfo.label}
                    </Badge>
                    {levelInfo && (
                      <Badge className={`bg-gradient-to-r ${levelInfo.color} text-white font-semibold shadow-md px-3 py-1`}>
                        <span className="mr-1.5">{levelInfo.emoji}</span>
                        {levelInfo.label}
                      </Badge>
                    )}
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md px-3 py-1">
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Enrolled
                    </Badge>
                  </div>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteParticipant(participant.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-red-200 dark:border-red-700 shadow-lg h-10 w-10 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Contact Information Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Contact Information
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg p-3 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <span className="truncate font-medium">{participant.email}</span>
                </div>
                {participant.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg p-3 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">{participant.phone}</span>
                  </div>
                )}
              </div>

              {/* Education Information Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Education Details
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {educationSpecialtyLabels[participant.education_specialty] || participant.education_specialty}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Education Level: <span className="font-semibold">{participant.education_level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Registration Date */}
            <div className="mt-5 pt-4 border-t-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  Enrolled on{" "}
                  {new Date(participant.registration_date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
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
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 shadow-lg font-bold"
          >
            <Users className="h-4 w-4 mr-2" />
            View Participants ({participants.length})
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-slate-800 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 flex flex-col overflow-hidden p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b-2 border-purple-200 dark:border-purple-700 flex-shrink-0 bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/30 dark:to-pink-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Users className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Training Participants
                </DialogTitle>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">{training.title}</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg text-base px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              {participants.length} Total
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
            <Input
              placeholder="Search participants by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-2 border-purple-200 dark:border-purple-700 focus:ring-purple-500 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-lg"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <motion.div
                  className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 rounded-full flex items-center justify-center mb-6 shadow-2xl"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  {searchTerm ? (
                    <Search className="h-12 w-12 text-white" />
                  ) : (
                    <Users className="h-12 w-12 text-white" />
                  )}
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">
                  {searchTerm ? "No participants found" : "No participants yet"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  {searchTerm ? "Try adjusting your search terms" : "Participants will appear here once they enroll"}
                </p>
              </div>
            </div>
          ) : training.status === "completed" ? (
            <Tabs defaultValue="all" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 mb-6 h-14 p-1 rounded-xl">
                <TabsTrigger
                  value="all"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold"
                >
                  <Users className="h-4 w-4 mr-2" />
                  All ({filteredParticipants.length})
                </TabsTrigger>
                {Object.entries(groupedParticipants).map(([level, parts]) => {
                  const config = levelConfig[level as keyof typeof levelConfig]
                  return (
                    <TabsTrigger
                      key={level}
                      value={level}
                      className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold"
                    >
                      <span className="mr-2">{config.emoji}</span>
                      {config.label} ({parts.length})
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-full pr-4">
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
                          <config.icon className={`h-20 w-20 mx-auto mb-6 ${config.textColor}`} />
                          <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">
                            No {config.label.toLowerCase()} participants
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-full pr-4">
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
            <ScrollArea className="h-full pr-4">
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