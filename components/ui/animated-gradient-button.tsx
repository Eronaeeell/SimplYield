"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedGradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  gradientFrom: string
  gradientTo: string
  hoverGradientFrom?: string
  hoverGradientTo?: string
  className?: string
  children: React.ReactNode
  glowColor?: string
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline" | "ghost"
  disabled?: boolean
  onClick?: () => void
}

export const AnimatedGradientButton = React.forwardRef<HTMLButtonElement, AnimatedGradientButtonProps>(
  (
    {
      gradientFrom,
      gradientTo,
      hoverGradientFrom,
      hoverGradientTo,
      className,
      children,
      glowColor = "rgba(124, 58, 237, 0.5)",
      size = "default",
      variant = "default",
      disabled = false,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const [isPressed, setIsPressed] = React.useState(false)

    const handleMouseEnter = () => {
      if (!disabled) setIsHovered(true)
    }

    const handleMouseLeave = () => {
      if (!disabled) {
        setIsHovered(false)
        setIsPressed(false)
      }
    }

    const handleMouseDown = () => {
      if (!disabled) setIsPressed(true)
    }

    const handleMouseUp = () => {
      if (!disabled) setIsPressed(false)
    }

    const handleClick = () => {
      if (!disabled && onClick) onClick()
    }

    const sizeClasses = {
      sm: "px-2 py-1 text-sm",
      default: "px-3 py-2 text-base",
      lg: "px-5 py-2.5 text-lg",
    }

    const variantClasses = {
      default: "text-white",
      outline: "bg-transparent border-2",
      ghost: "bg-transparent hover:bg-opacity-10",
    }

    const fromColor = isHovered ? hoverGradientFrom || gradientFrom : gradientFrom
    const toColor = isHovered ? hoverGradientTo || gradientTo : gradientTo

    return (
      <button
        ref={ref}
        className={cn(
          "relative rounded-lg font-medium transition-all duration-300 overflow-hidden",
          sizeClasses[size],
          variantClasses[variant],
          isPressed ? "scale-95" : isHovered ? "scale-105" : "",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className,
        )}
        style={{
          background: variant === "default" ? `linear-gradient(to right, ${fromColor}, ${toColor})` : "transparent",
          borderColor: variant !== "default" ? `${gradientFrom}` : "transparent",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {/* Glow effect */}
        {isHovered && !disabled && (
          <div
            className="absolute inset-0 -z-10 opacity-70 blur-xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
              transform: "translate(0, 0)",
            }}
          />
        )}

        {/* Gradient border for outline variant */}
        {variant === "outline" && (
          <div
            className="absolute inset-0 -z-10 rounded-lg"
            style={{
              background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
              opacity: isHovered ? 0.2 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
        )}

        {/* Shine effect */}
        {isHovered && !disabled && variant === "default" && (
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: "linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.1) 50%, transparent 75%)",
              backgroundSize: "200% 200%",
              animation: "shine 1.5s infinite linear",
            }}
          />
        )}

        {children}

        <style jsx>{`
          @keyframes shine {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}</style>
      </button>
    )
  },
)

AnimatedGradientButton.displayName = "AnimatedGradientButton"
