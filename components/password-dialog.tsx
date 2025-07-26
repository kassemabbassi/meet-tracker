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
import { Lock, Eye, EyeOff, Shield } from "lucide-react"
import { AnimatePresence } from "framer-motion"

interface PasswordDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (password: string) => Promise<boolean>
  meetingName: string
  isLoading?: boolean
}

export function PasswordDialog({ isOpen, onClose, onSubmit, meetingName, isLoading = false }: PasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError("Password is required")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const success = await onSubmit(password)
      if (success) {
        setPassword("")
        onClose()
      } else {
        setError("Incorrect password. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setPassword("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-blue-200 dark:border-blue-700 mx-2 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <motion.div
              className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Shield className="h-5 w-5 text-white" />
            </motion.div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enter Meeting Password
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600 dark:text-slate-300">
            Please enter the password to access{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">"{meetingName}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="password" className="text-base font-semibold flex items-center space-x-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>Password</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                placeholder="Enter meeting password"
                className="h-12 text-base border-blue-200 dark:border-blue-700 focus:ring-blue-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm pr-12 shadow-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit()
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-slate-500" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-500" />
                )}
              </Button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-700"
                >
                  <Lock className="h-4 w-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
              <Shield className="h-4 w-4" />
              <span className="font-semibold">Security Notice</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              This meeting is password-protected for your privacy and security. Only users with the correct password can
              access the meeting data.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !password.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg w-full sm:w-auto"
            >
              {isSubmitting ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? "Verifying..." : "Access Meeting"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
