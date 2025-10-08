"use client"

import { useState, useEffect } from "react"
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
        <Button
          variant="outline"
          size="sm"
          className="border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800/50 font-semibold px-4 py-2 rounded-md flex items-center"
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Collaborators ({collaborators.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                Training Collaborators
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{training.title}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Creator Badge */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-600 rounded-lg">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">Training Creator</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Full management access</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-600 text-white border-0">Owner</Badge>
                </div>
              </div>

              {/* Collaborators List */}
              {collaborators.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No collaborators added</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    This training doesn't have any additional collaborators yet
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-3">
                    {collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-indigo-600 rounded-lg flex-shrink-0">
                              <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                                  {collaborator.collaborator_email}
                                </p>
                                {collaborator.collaborator_email.toLowerCase() === currentUserEmail.toLowerCase() && (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 border-0 text-xs">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                <Mail className="h-3 w-3" />
                                <span className="text-xs truncate">
                                  Added {new Date(collaborator.added_at).toLocaleDateString("en-US")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-indigo-600 text-white border-0 flex-shrink-0">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Collaborator
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    All collaborators have full management access to this training including adding participants,
                    viewing data, and completing the training.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}