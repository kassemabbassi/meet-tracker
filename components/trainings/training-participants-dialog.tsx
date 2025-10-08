"use client"

import { useState, useEffect } from "react"
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
import { Users, Mail, Phone, GraduationCap, User, CheckCircle, Star, Rocket, Sparkles, Award } from "lucide-react"
import { trainingRegistrationService, type Training, type TrainingRegistration } from "@/lib/supabase"

interface TrainingParticipantsDialogProps {
  training: Training
}

const levelConfig = {
  beginner: {
    label: "Débutants",
    icon: Sparkles,
    color: "bg-green-600",
    borderColor: "border-green-200 dark:border-green-700",
    textColor: "text-green-700 dark:text-green-300",
  },
  intermediate: {
    label: "Intermédiaires",
    icon: Rocket,
    color: "bg-blue-600",
    borderColor: "border-blue-200 dark:border-blue-700",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  advanced: {
    label: "Avancés",
    icon: Star,
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
  other: "Autre",
}

const memberTypeConfig = {
  adherent: {
    label: "Membre Adhérent",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  },
  actif: {
    label: "Membre Actif",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200",
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

  const ParticipantCard = ({ participant }: { participant: TrainingRegistration }) => {
    const memberConfig = memberTypeConfig[participant.member_type as keyof typeof memberTypeConfig]
    const trainingLevelConfig = participant.training_level 
      ? levelConfig[participant.training_level as keyof typeof levelConfig]
      : null

    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-start justify-between space-x-3 mb-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className={`w-12 h-12 ${trainingLevelConfig?.color || "bg-purple-600"} rounded-full flex items-center justify-center flex-shrink-0`}>
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate mb-1">
                  {participant.first_name} {participant.last_name}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${memberConfig.color} font-medium text-xs`}>
                    {memberConfig.label}
                  </Badge>
                  {trainingLevelConfig && (
                    <Badge className={`${trainingLevelConfig.color} text-white font-medium text-xs`}>
                      {trainingLevelConfig.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 flex-shrink-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Inscrit
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md p-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-purple-500" />
                <span className="truncate font-medium">{participant.email}</span>
              </div>
              {participant.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md p-2">
                  <Phone className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span className="font-medium">{participant.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md p-2">
                <GraduationCap className="h-4 w-4 flex-shrink-0 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">
                    {educationSpecialtyLabels[participant.education_specialty] || participant.education_specialty}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Niveau {participant.education_level}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Award className="h-3 w-3 mr-1" />
              Inscrit le {new Date(participant.registration_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric"
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
          className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800/50 font-semibold px-4 py-2 rounded-md flex items-center"
        >
          <Users className="h-4 w-4 mr-2" />
          Voir les Participants ({participants.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl md:max-w-4xl h-[85vh] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden rounded-lg p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2 text-xl sm:text-2xl">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Participants - {training.title}</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {participants.length} participant{participants.length > 1 ? "s" : ""} inscrit
            {participants.length > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : participants.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Aucun participant pour le moment
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  Les inscriptions apparaîtront ici une fois que les participants s'inscriront
                </p>
              </div>
            </div>
          ) : training.status === "completed" ? (
            <Tabs defaultValue="all" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mb-4 p-1 rounded-md">
                <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-600 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-purple-300">
                  Tous ({participants.length})
                </TabsTrigger>
                {Object.entries(groupedParticipants).map(([level, parts]) => {
                  const config = levelConfig[level as keyof typeof levelConfig]
                  return (
                    <TabsTrigger
                      key={level}
                      value={level}
                      className="rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-600 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-purple-300"
                    >
                      {config.label} ({parts.length})
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-full pr-2 sm:pr-4">
                  <div className="space-y-3">
                    {participants.map((participant) => (
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
                          <config.icon className={`h-12 w-12 mx-auto mb-4 ${config.textColor}`} />
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                            Aucun participant {config.label.toLowerCase()}
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-full pr-2 sm:pr-4">
                        <div className="space-y-3">
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
            <ScrollArea className="h-full pr-2 sm:pr-4">
              <div className="space-y-3">
                {participants.map((participant) => (
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