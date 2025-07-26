"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, UserPlus, Sparkles, LogIn } from "lucide-react"
import { userService, type AppUser } from "@/lib/supabase"

interface UserSelectorProps {
  onUserSelected: (user: AppUser) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
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

export function UserSelector({ onUserSelected }: UserSelectorProps) {
  const [users, setUsers] = useState<AppUser[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newDisplayName, setNewDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newDisplayName.trim()) return

    setIsCreating(true)
    try {
      const user = await userService.createUser(newUsername.trim(), newDisplayName.trim())
      if (user) {
        setUsers((prev) => [...prev, user])
        setNewUsername("")
        setNewDisplayName("")
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error("Error creating user:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-1000 ease-in-out relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="container mx-auto px-4 py-8 max-w-4xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <motion.div
            className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6"
            variants={floatingVariants}
            animate="animate"
          >
            <Users className="h-12 w-12 text-white" />
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Chkoun Hadher v9
          </motion.h1>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-300 font-medium mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Professional Meeting Tracker with Enhanced Security
          </motion.p>
          <motion.p
            className="text-lg text-slate-500 dark:text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            Select your user profile to access your private meetings
          </motion.p>
        </motion.div>

        {/* User Selection */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-700 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-t-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Select User Profile
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      Choose your profile to access your private meeting space
                    </CardDescription>
                  </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create New User
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-blue-200 dark:border-blue-700 mx-2">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2 text-xl">
                        <UserPlus className="h-5 w-5 text-blue-600" />
                        <span>Create New User</span>
                      </DialogTitle>
                      <DialogDescription>Create a new user profile for the meeting tracker</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="Enter unique username"
                          className="border-blue-200 dark:border-blue-700 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input
                          id="display-name"
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          placeholder="Enter full name"
                          className="border-blue-200 dark:border-blue-700 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateUser}
                        disabled={isCreating || !newUsername.trim() || !newDisplayName.trim()}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        {isCreating ? (
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isCreating ? "Creating..." : "Create User"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence>
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <motion.div
                      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                  </div>
                ) : users.length === 0 ? (
                  <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <motion.div
                      className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-xl"
                      variants={floatingVariants}
                      animate="animate"
                    >
                      <UserPlus className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      No users found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg">
                      Create your first user profile to get started
                    </p>
                  </motion.div>
                ) : (
                  <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" layout>
                    {users.map((user, index) => (
                      <motion.div
                        key={user.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer"
                        onClick={() => onUserSelected(user)}
                      >
                        <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                          <CardContent className="p-6 text-center">
                            <motion.div
                              className="mx-auto mb-4"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <Avatar className="w-16 h-16 mx-auto shadow-lg">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                                  {getInitials(user.display_name)}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">
                              {user.display_name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">@{user.username}</p>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold"
                            >
                              <LogIn className="h-4 w-4" />
                              <span>Select Profile</span>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              icon: "🔒",
              title: "Password Protected",
              description: "Each meeting is secured with a custom password for enhanced privacy",
            },
            {
              icon: "👤",
              title: "User Isolation",
              description: "Complete data separation - users can only access their own meetings",
            },
            {
              icon: "📊",
              title: "Professional Tracking",
              description: "Advanced participation tracking with beautiful analytics and exports",
            },
          ].map((feature, index) => (
            <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }} className="text-center">
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-blue-100 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
