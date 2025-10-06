"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

const shimmerVariants = {
  animate: {
    backgroundPosition: ["200% 0%", "-200% 0%"],
    transition: {
      duration: 8,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
}

export function TrainingsManagement({ user }: TrainingsManagementProps) {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all")
  const [trainingToComplete, setTrainingToComplete] = useState<string | null>(null)
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

  const handleDeleteTraining = async (trainingId: string) => {
    const success = await trainingService.deleteTraining(user.id, user.email, trainingId)
    if (success) {
      setTrainings((prev) => prev.filter((t) => t.id !== trainingId))
    }
  }

  const getStatusBadge = (status: Training["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-0">
            <PlayCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg border-0">
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
    <div className="space-y-8">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-8 shadow-2xl"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={shimmerVariants}
          animate="animate"
          style={{ backgroundSize: "200% 100%" }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.div
                className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <GraduationCap className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Training Management</h2>
                <p className="text-white/90 text-lg">Create and manage professional training programs</p>
              </div>
            </div>
            <CreateTrainingDialog userId={user.id} userEmail={user.email} onTrainingCreated={handleTrainingCreated} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Active Programs</p>
                  <p className="text-4xl font-bold text-white">{activeCount}</p>
                </div>
                <div className="p-3 bg-green-500/30 rounded-xl">
                  <PlayCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Completed</p>
                  <p className="text-4xl font-bold text-white">{completedCount}</p>
                </div>
                <div className="p-3 bg-blue-500/30 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Total Enrolled</p>
                  <p className="text-4xl font-bold text-white">{totalParticipants}</p>
                </div>
                <div className="p-3 bg-purple-500/30 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-xl"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
            <Input
              placeholder="Search trainings by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-base border-2 border-purple-200 dark:border-purple-700 focus:ring-purple-500 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
            />
          </div>
          <Tabs
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full md:w-auto grid-cols-3 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl p-1">
              <TabsTrigger
                value="all"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg"
              >
                <Filter className="h-4 w-4 mr-2" />
                All ({trainings.length})
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Active ({activeCount})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed ({completedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* Trainings List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        </div>
      ) : filteredTrainings.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 rounded-full flex items-center justify-center mb-6 shadow-2xl"
            variants={floatingVariants}
            animate="animate"
          >
            {searchTerm || filterStatus !== "all" ? (
              <Search className="h-16 w-16 text-white" />
            ) : (
              <GraduationCap className="h-16 w-16 text-white" />
            )}
          </motion.div>
          <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {searchTerm || filterStatus !== "all" ? "No trainings found" : "No trainings yet"}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first training program to get started"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <CreateTrainingDialog userId={user.id} userEmail={user.email} onTrainingCreated={handleTrainingCreated} />
          )}
        </motion.div>
      ) : (
        <ScrollArea className="h-[700px] pr-4">
          <div className="space-y-6">
            <AnimatePresence>
              {filteredTrainings.map((training, index) => (
                <motion.div
                  key={training.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="group"
                >
                  <Card className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-slate-800 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <CardHeader className="relative bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-rose-100/50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-rose-900/30 border-b-2 border-purple-200 dark:border-purple-700 pb-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start gap-4">
                            <motion.div
                              className="p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl flex-shrink-0"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <GraduationCap className="h-7 w-7 text-white" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <CardTitle className="text-2xl lg:text-3xl text-slate-800 dark:text-slate-100">
                                  {training.title}
                                </CardTitle>
                                {getStatusBadge(training.status)}
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                                  <Users className="h-3 w-3 mr-1" />
                                  {participantCounts[training.id] || 0} enrolled
                                </Badge>
                              </div>
                              {training.description && (
                                <CardDescription className="text-base text-slate-700 dark:text-slate-300 line-clamp-2">
                                  {training.description}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <TrainingCollaboratorsView training={training} currentUserEmail={user.email} />
                          <TrainingParticipantsView training={training} onUpdate={loadTrainings} />
                          {training.status === "active" && (
                            <>
                              <RegistrationFormDialog training={training} onRegistrationSuccess={loadTrainings} />
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  onClick={() => setTrainingToComplete(training.id)}
                                  variant="outline"
                                  size="sm"
                                  className="bg-white/80 dark:bg-slate-800/80 border-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 shadow-lg"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete
                                </Button>
                              </motion.div>
                            </>
                          )}
                          <motion.div whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => handleDeleteTraining(training.id)}
                              variant="outline"
                              size="sm"
                              className="bg-white/80 dark:bg-slate-800/80 border-2 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 shadow-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {training.start_date && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-300 dark:border-purple-700 shadow-lg"
                          >
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                                Start Date
                              </p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                {new Date(training.start_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {training.duration && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-300 dark:border-blue-700 shadow-lg"
                          >
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                                Duration
                              </p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                {training.duration}
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {training.location && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl border border-pink-300 dark:border-pink-700 shadow-lg"
                          >
                            <div className="p-2 bg-pink-500 rounded-lg">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-pink-700 dark:text-pink-300 uppercase tracking-wide">
                                Location
                              </p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                {training.location}
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {training.max_participants && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-300 dark:border-green-700 shadow-lg"
                          >
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                                Capacity
                              </p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                {participantCounts[training.id] || 0} / {training.max_participants}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {training.objectives && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700 shadow-lg"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                              <Target className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                              Learning Objectives
                            </h4>
                          </div>
                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{training.objectives}</p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {/* Complete Training Confirmation Dialog */}
      <AlertDialog open={!!trainingToComplete} onOpenChange={(open) => !open && setTrainingToComplete(null)}>
        <AlertDialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-2 border-blue-300 dark:border-blue-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <span>Complete Training?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-600 dark:text-slate-300 pt-2">
              Are you sure you want to mark this training as completed? This action will change the training status and
              participants will be grouped by their skill levels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting} className="border-2 border-slate-300 dark:border-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteTraining}
              disabled={isCompleting}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
            >
              {isCompleting ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
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
    </div>
  )
}
