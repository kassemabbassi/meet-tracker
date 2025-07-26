"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Sparkles, Shield } from "lucide-react"

interface UserNameDialogProps {
  isOpen: boolean
  onSubmit: (name: string) => void
}

export function UserNameDialog({ isOpen, onSubmit }: UserNameDialogProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      onSubmit(name.trim())
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-[95vw] max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-blue-200 dark:border-blue-700 mx-2 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <motion.div
              className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <User className="h-5 w-5 text-white" />
            </motion.div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Chkoun Hadher v9
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600 dark:text-slate-300">
            Please enter your name to get started. This will be used to identify your meetings and keep them private.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="user-name" className="text-base font-semibold flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-600" />
              <span>Your Name</span>
            </Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="h-12 text-base border-blue-200 dark:border-blue-700 focus:ring-blue-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit()
                }
              }}
              autoFocus
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
              <Shield className="h-4 w-4" />
              <span className="font-semibold">Privacy Notice</span>
            </div>
            <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1">
              <li>• Your name is stored locally in your browser</li>
              <li>• Only you can access meetings you create</li>
              <li>• Each meeting is password-protected for security</li>
              <li>• No personal data is shared with other users</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg w-full text-base py-3"
            >
              {isSubmitting ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? "Setting up..." : "Get Started"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
