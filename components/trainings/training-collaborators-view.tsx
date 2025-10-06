"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserCheck, Users, Mail, Crown, Shield } from "lucide-react"
import { trainingCollaboratorService, type Training, type TrainingCollaborator } from "@/lib/supabase"

interface TrainingCollaboratorsViewProps {
  training: Training
  currentUserEmail: string
}

export function TrainingCollaboratorsView({ training, currentUserEmail }: TrainingCollaboratorsViewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [collaborators, setCollaborators] = useState<TrainingCollaborator[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadCollaborators()
    }
  }, [isOpen])

  const loadCollaborators = async () => {
    setIsLoading(true)
    try {
      const data = await trainingCollaboratorService.getTrainingCollaborators(training.id)
      setCollaborators(data)
    } catch (error) {
      console.error("Error loading collaborators:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-lg font-bold"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Collaborators ({collaborators.length})
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[95vw] bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-slate-800 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-300 dark:border-indigo-700 shadow-2xl">
        <DialogHeader className="border-b-2 border-indigo-200 dark:border-indigo-700 pb-4">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <UserCheck className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Training Collaborators
              </DialogTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{training.title}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Creator Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border-2 border-amber-300 dark:border-amber-700 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Training Creator</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Full management access</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                    Owner
                  </Badge>
                </div>
              </motion.div>

              {/* Collaborators List */}
              {collaborators.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">No collaborators added</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    This training doesn't have any additional collaborators yet
                  </p>
                </motion.div>
              ) : (
                <ScrollArea className="max-h-[400px] pr-4">
                  <div className="space-y-3">
                    {collaborators.map((collaborator, index) => (
                      <motion.div
                        key={collaborator.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border-2 border-indigo-200 dark:border-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex-shrink-0">
                              <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {collaborator.collaborator_email}
                                </p>
                                {collaborator.collaborator_email.toLowerCase() === currentUserEmail.toLowerCase() && (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 border-0 text-xs">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mt-1">
                                <Mail className="h-3 w-3" />
                                <span className="text-xs truncate">
                                  Added {new Date(collaborator.added_at).toLocaleDateString("en-US")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg flex-shrink-0">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Collaborator
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
              >
                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    All collaborators have full management access to this training including adding participants,
                    viewing data, and completing the training.
                  </span>
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
