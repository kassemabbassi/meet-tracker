"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Mail, Phone, BookOpen, User, CheckCircle, Star, Rocket, Sparkles } from "lucide-react"
import { trainingRegistrationService, type Training, type TrainingRegistration } from "@/lib/supabase"

interface TrainingParticipantsDialogProps {
  training: Training
}

const levelConfig = {
  beginner: {
    label: "Débutants",
    icon: Sparkles,
    color: "from-green-400 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    borderColor: "border-green-200 dark:border-green-700",
    textColor: "text-green-700 dark:text-green-300",
    emoji: "🌱",
  },
  intermediate: {
    label: "Intermédiaires",
    icon: Rocket,
    color: "from-blue-400 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    borderColor: "border-blue-200 dark:border-blue-700",
    textColor: "text-blue-700 dark:text-blue-300",
    emoji: "🚀",
  },
  advanced: {
    label: "Avancés",
    icon: Star,
    color: "from-purple-400 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    borderColor: "border-purple-200 dark:border-purple-700",
    textColor: "text-purple-700 dark:text-purple-300",
    emoji: "⭐",
  },
}

export function TrainingParticipantsDialog({ training }: TrainingParticipantsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [participants, setParticipants] = useState<TrainingRegistration[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  const groupedParticipants = {
    beginner: participants.filter((p) => p.training_level === "beginner"),
    intermediate: participants.filter((p) => p.training_level === "intermediate"),
    advanced: participants.filter((p) => p.training_level === "advanced"),
  }

  const ParticipantCard = ({ participant, index }: { participant: TrainingRegistration; index: number }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between space-x-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">
                  {participant.first_name} {participant.last_name}
                </h4>
                <div className="flex flex-col space-y-1 mt-1">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{participant.email}</span>
                  </div>
                  {participant.phone && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{participant.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                    <BookOpen className="h-3 w-3 flex-shrink-0" />
                    <span>{participant.education_level}</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 flex-shrink-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Inscrit
            </Badge>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Inscrit le {new Date(participant.registration_date).toLocaleDateString("fr-FR")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400"
          >
            <Users className="h-4 w-4 mr-2" />
            Voir les Participants ({participants.length})
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-purple-200 dark:border-purple-700 flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-purple-200 dark:border-purple-700 flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Users className="h-6 w-6 text-purple-600" />
            <span>Participants - {training.title}</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            {participants.length} participant{participants.length > 1 ? "s" : ""} inscrit
            {participants.length > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </div>
          ) : participants.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">
                  Aucun participant pour le moment
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Les inscriptions apparaîtront ici une fois que les participants s'inscriront
                </p>
              </div>
            </div>
          ) : training.status === "completed" ? (
            // Grouped view for completed trainings
            <Tabs defaultValue="all" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-700">
                <TabsTrigger value="all">Tous ({participants.length})</TabsTrigger>
                {Object.entries(groupedParticipants).map(([level, parts]) => {
                  const config = levelConfig[level as keyof typeof levelConfig]
                  return (
                    <TabsTrigger key={level} value={level}>
                      <span className="mr-2">{config.emoji}</span>
                      {config.label} ({parts.length})
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value="all" className="flex-1 overflow-hidden mt-4">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-3">
                    {participants.map((participant, index) => (
                      <ParticipantCard key={participant.id} participant={participant} index={index} />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {Object.entries(groupedParticipants).map(([level, parts]) => {
                const config = levelConfig[level as keyof typeof levelConfig]
                return (
                  <TabsContent key={level} value={level} className="flex-1 overflow-hidden mt-4">
                    {parts.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <config.icon className={`h-16 w-16 mx-auto mb-4 ${config.textColor}`} />
                          <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">
                            Aucun participant {config.label.toLowerCase()}
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-full pr-4">
                        <div className="space-y-3">
                          {parts.map((participant, index) => (
                            <ParticipantCard key={participant.id} participant={participant} index={index} />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
          ) : (
            // Simple list view for active trainings
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <ParticipantCard key={participant.id} participant={participant} index={index} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
