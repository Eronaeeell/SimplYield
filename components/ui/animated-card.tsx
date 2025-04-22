"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hoverEffect?: "lift" | "glow" | "border" | "none"
  clickEffect?: boolean
  delay?: number
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, hoverEffect = "lift", clickEffect = false, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg overflow-hidden",
          hoverEffect === "lift" && "hover:-translate-y-1 transition-transform duration-300",
          hoverEffect === "glow" && "hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300",
          hoverEffect === "border" && "hover:border-purple-500/50 transition-colors duration-300",
          clickEffect && "active:scale-95 transition-transform duration-200",
          className,
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay * 0.1 }}
        whileHover={hoverEffect === "glow" ? { boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.2)" } : undefined}
        whileTap={clickEffect ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

AnimatedCard.displayName = "AnimatedCard"
