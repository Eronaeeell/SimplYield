"use client"
import { useSpring, animated } from "react-spring"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  formatValue?: (value: number) => string
  duration?: number
  delay?: number
  className?: string
}

export function AnimatedNumber({
  value,
  formatValue = (val) => val.toFixed(2),
  duration = 1000,
  delay = 0,
  className,
}: AnimatedNumberProps) {
  const springProps = useSpring({
    from: { value: 0 },
    to: { value },
    delay,
    config: { duration },
  })

  return (
    <animated.span className={cn("tabular-nums", className)}>
      {springProps.value.to((val) => formatValue(val))}
    </animated.span>
  )
}
