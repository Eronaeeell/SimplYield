"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from "recharts"
import { motion } from "framer-motion"

interface AnimatedPieChartProps {
  data: Array<{
    id: string
    name: string
    value: number
    percentage: number
    color: string
  }>
  width?: number | string
  height?: number | string
  innerRadius?: number
  outerRadius?: number
  onClick?: (data: any, index: number) => void
}

export function AnimatedPieChart({
  data,
  width = "100%",
  height = "100%",
  innerRadius = 60,
  outerRadius = 100,
  onClick,
}: AnimatedPieChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.8}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 16}
          fill={fill}
          opacity={0.4}
        />
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" fontSize={16} fontWeight="bold">
          {payload.name}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="#d1d5db" fontSize={14}>
          {payload.percentage.toFixed(2)}%
        </text>
        <text x={cx} y={cy + 35} textAnchor="middle" fill="#9ca3af" fontSize={12}>
          ${payload.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </text>
      </g>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width, height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={(_, index) => {
              setActiveIndex(index)
              if (onClick) onClick(data[index], index)
            }}
            animationBegin={0}
            animationDuration={1000}
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-opacity duration-300"
                style={{
                  opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.6,
                  filter: activeIndex === index ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))" : "none",
                }}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-gray-800 p-2 rounded border border-gray-700 shadow-lg">
                    <p className="font-medium text-white">{data.name}</p>
                    <p className="text-gray-300">{data.percentage.toFixed(2)}%</p>
                    <p className="text-gray-400">${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
