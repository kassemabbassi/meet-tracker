"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  GraduationCap,
  Calendar,
  MapPin,
  Users,
  Clock,
  Target,
  Trash2,
  CheckCircle,
  PlayCircle,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react"
import { CreateTrainingDialog } from "./create-training-dialog"
import { RegistrationFormDialog } from "./registration-form-dialog"
import { TrainingParticipantsView } from "./training-participants-view"
import { TrainingCollaboratorsView } from "./training-collaborators-view"
import { trainingService, trainingRegistrationService, type Training, type AppUser } from "@/lib/supabase"

interface TrainingsManagementProps {
  user: AppUser
}

export function TrainingsManagement({ user }: TrainingsManagementProps) {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all")
  const [trainingToComplete, setTrainingToComplete] = useState<string | null>(null)
  const [trainingToDelete, setTrainingToDelete] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    loadTrainings()
  }, [])

  const loadTrainings = async () => {
    setIsLoading(true)
    try {
      const data = await trainingService.getAllTrainings(user.id, user.email)
      setTrainings(data)

      const counts: Record<string, number> = {}
      for (const training of data) {
        const participants = await trainingRegistrationService.getTrainingRegistrations(training.id)
        counts[training.id] = participants.length
      }
      setParticipantCounts(counts)
    } catch (error) {
      console.error("Error loading trainings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrainingCreated = (training: Training) => {
    setTrainings([training, ...trainings])
    setParticipantCounts((prev) => ({ ...prev, [training.id]: 0 }))
  }

  const handleCompleteTraining = async () => {
    if (!trainingToComplete) return

    setIsCompleting(true)
    try {
      const success = await trainingService.updateTrainingStatus(user.id, user.email, trainingToComplete, "completed")
      if (success) {
        setTrainings((prev) => prev.map((t) => (t.id === trainingToComplete ? { ...t, status: "completed" } : t)))
      }
    } finally {
      setIsCompleting(false)
      setTrainingToComplete(null)
    }
  }

  const handleDeleteTraining = async () => {
    if (!trainingToDelete) return

    const success = await trainingService.deleteTraining(user.id, user.email, trainingToDelete)
    if (success) {
      setTrainings((prev) => prev.filter((t) => t.id !== trainingToDelete))
    }
    setTrainingToDelete(null)
  }

  const getStatusBadge = (status: Training["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-600 text-white">
            <PlayCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-blue-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
    }
  }

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.location?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || training.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const activeCount = trainings.filter((t) => t.status === "active").length
  const completedCount = trainings.filter((t) => t.status === "completed").length
  const totalParticipants = Object.values(participantCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="rounded-lg bg-indigo-600 p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">Training Management</h2>
              <p className="text-white/90 text-base">Create and manage professional training programs</p>
            </div>
          </div>
          <CreateTrainingDialog userId={user.id} userEmail={user.email} onTrainingCreated={handleTrainingCreated} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Active Programs</p>
                <p className="text-3xl font-bold text-white">{activeCount}</p>
              </div>
              <div className="p-2 bg-green-600/30 rounded-lg">
                <PlayCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-white">{completedCount}</p>
              </div>
              <div className="p-2 bg-blue-600/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Total Enrolled</p>
                <p className="text-3xl font-bold text-white">{totalParticipants}</p>
              </div>
              <div className="p-2 bg-purple-600/30 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search trainings by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 bg-white dark:bg-gray-700 rounded-md"
            />
          </div>
          <Tabs
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              <TabsTrigger
                value="all"
                className="rounded-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-indigo-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                All ({trainings.length})
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="rounded-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-indigo-300"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Active ({activeCount})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-indigo-300"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed ({completedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Trainings List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-12 h-12 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTrainings.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            {searchTerm || filterStatus !== "all" ? (
              <Search className="h-10 w-10 text-white" />
            ) : (
              <GraduationCap className="h-10 w-10 text-white" />
            )}
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm || filterStatus !== "all" ? "No trainings found" : "No trainings yet"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-base mb-4">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first training program to get started"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <CreateTrainingDialog userId={user.id} userEmail={user.email} onTrainingCreated={handleTrainingCreated} />
          )}
        </div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {filteredTrainings.map((training) => (
              <Card key={training.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-indigo-600 rounded-lg flex-shrink-0">
                          <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <CardTitle className="text-xl lg:text-2xl text-gray-900 dark:text-gray-100">
                              {training.title}
                            </CardTitle>
                            {getStatusBadge(training.status)}
                            <Badge className="bg-purple-600 text-white">
                              <Users className="h-3 w-3 mr-1" />
                              {participantCounts[training.id] || 0} enrolled
                            </Badge>
                          </div>
                          {training.description && (
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {training.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <TrainingCollaboratorsView training={training} currentUserEmail={user.email} />
                      <TrainingParticipantsView training={training} onUpdate={loadTrainings} />
                      {training.status === "active" && (
                        <>
                          <RegistrationFormDialog training={training} onRegistrationSuccess={loadTrainings} />
                          <Button
                            onClick={() => setTrainingToComplete(training.id)}
                            variant="outline"
                            size="sm"
                            className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800/50"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => setTrainingToDelete(training.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-800/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {training.start_date && (
                      <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-700">
                        <div className="p-1.5 bg-purple-600 rounded">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Start Date</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {new Date(training.start_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {training.duration && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
                        <div className="p-1.5 bg-blue-600 rounded">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Duration</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {training.duration}
                          </p>
                        </div>
                      </div>
                    )}

                    {training.location && (
                      <div className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-md border border-pink-200 dark:border-pink-700">
                        <div className="p-1.5 bg-pink-600 rounded">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-pink-700 dark:text-pink-300">Location</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {training.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {training.max_participants && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-700">
                        <div className="p-1.5 bg-green-600 rounded">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-green-700 dark:text-green-300">Capacity</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {participantCounts[training.id] || 0} / {training.max_participants}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {training.objectives && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-purple-600 rounded">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                          Learning Objectives
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{training.objectives}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Complete Training Confirmation Dialog */}
      <AlertDialog open={!!trainingToComplete} onOpenChange={(open) => !open && setTrainingToComplete(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-blue-600 rounded">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span>Complete Training?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-300 pt-2">
              Are you sure you want to mark this training as completed? This action will change the training status and
              participants will be grouped by their skill levels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting} className="border-gray-300 dark:border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteTraining}
              disabled={isCompleting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCompleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Training
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Training Confirmation Dialog */}
      <AlertDialog open={!!trainingToDelete} onOpenChange={(open) => !open && setTrainingToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-red-600 rounded">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              <span>Delete Training?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-300 pt-2">
              Are you sure you want to delete this training? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 dark:border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTraining}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Training
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}