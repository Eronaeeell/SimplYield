"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type NotificationType = "success" | "error" | "info" | "warning"

interface NotificationToastProps {
  type: NotificationType
  title: string
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
}

export function NotificationToast({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
  position = "bottom-right",
}: NotificationToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      case "info":
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "top-4 right-4"
      case "top-left":
        return "top-4 left-4"
      case "bottom-right":
        return "bottom-4 right-4"
      case "bottom-left":
        return "bottom-4 left-4"
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500/10 border-green-500/30"
      case "error":
        return "bg-red-500/10 border-red-500/30"
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30"
      case "info":
        return "bg-blue-500/10 border-blue-500/30"
    }
  }

  // Animation variants based on position
  const getAnimationVariants = () => {
    if (position === "bottom-right") {
      return {
        initial: { opacity: 0, y: 20, x: 20, scale: 0.95 },
        animate: {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8,
          },
        },
        exit: {
          opacity: 0,
          y: 10,
          x: 20,
          scale: 0.95,
          transition: {
            duration: 0.2,
            ease: "easeOut",
          },
        },
      }
    }

    // Default animations for other positions
    return {
      initial: { opacity: 0, y: position.startsWith("top") ? -20 : 20, x: position.endsWith("right") ? 20 : -20 },
      animate: { opacity: 1, y: 0, x: 0 },
      exit: { opacity: 0, y: position.startsWith("top") ? -20 : 20, x: position.endsWith("right") ? 20 : -20 },
    }
  }

  const variants = getAnimationVariants()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn("fixed z-50 max-w-md", getPositionClasses())}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
        >
          <motion.div
            className={cn("rounded-lg border p-4 shadow-lg backdrop-blur-sm", getBgColor())}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">{getIcon()}</div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="mt-1 text-sm text-gray-300">{message}</p>
              </div>
              <motion.button
                type="button"
                className="ml-4 inline-flex text-gray-400 hover:text-gray-300 focus:outline-none"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
