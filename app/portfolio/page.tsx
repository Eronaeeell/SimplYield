"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BarChart2,
  TrendingUp,
  PieChart,
  Clock,
  Wallet,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  DollarSign,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedPieChart } from "@/components/ui/animated-pie-chart"
import { AnimatedGradientButton } from "@/components/ui/animated-gradient-button"
import { PageTransition } from "@/components/ui/page-transition"
import { NotificationToast } from "@/components/ui/notification-toast"

export default function PortfolioPage() {
  const router = useRouter()
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: "success", title: "", message: "" })
  const [isLoaded, setIsLoaded] = useState(false)

  // Mock portfolio data
  const portfolioData = {
    totalBalance: 245.32,
    totalBalanceUSD: 24532.0,
    change: {
      "24h": 4.2,
      "1w": 7.8,
      "1m": 12.5,
      "3m": -3.2,
      "1y": 32.1,
    },
    assets: [
      {
        id: "sol",
        name: "SOL",
        amount: 145.62,
        value: 14562.0,
        percentage: 59.4,
        change: 2.3,
        price: 100.0,
        apy: 5.8,
        staked: 102.5,
        rewards: 1.25,
        color: "#9333ea", // purple-600
      },
      {
        id: "usdc",
        name: "USDC",
        amount: 5500,
        value: 5500.0,
        percentage: 22.4,
        change: 0.1,
        price: 1.0,
        apy: 3.2,
        staked: 3000,
        rewards: 24.0,
        color: "#3b82f6", // blue-500
      },
      {
        id: "msol",
        name: "mSOL",
        amount: 40.8,
        value: 4080.0,
        percentage: 16.6,
        change: 1.8,
        price: 100.0,
        apy: 6.2,
        staked: 40.8,
        rewards: 0.63,
        color: "#22c55e", // green-500
      },
      {
        id: "other",
        name: "Other",
        amount: 1,
        value: 390.0,
        percentage: 1.6,
        change: -0.5,
        price: 390.0,
        apy: 0,
        staked: 0,
        rewards: 0,
        color: "#6b7280", // gray-500
      },
    ],
    stakingPositions: [
      {
        name: "Liquid Staking",
        apy: 5.2,
        staked: 102.5,
        rewards: 1.25,
        icon: <BarChart2 className="h-4 w-4 text-white" />,
        color: "purple",
      },
      {
        name: "Yield Farming",
        apy: 8.7,
        staked: 43.1,
        rewards: 0.92,
        icon: <PieChart className="h-4 w-4 text-white" />,
        color: "blue",
      },
    ],
  }

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false)
      setToastMessage({
        type: "success",
        title: "Data Refreshed",
        message: "Your portfolio data has been updated with the latest information.",
      })
      setShowToast(true)
    }, 1500)
  }

  const toggleAssetExpand = (assetId: string) => {
    if (expandedAsset === assetId) {
      setExpandedAsset(null)
    } else {
      setExpandedAsset(assetId)
    }
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case "purple":
        return "bg-purple-500"
      case "blue":
        return "bg-blue-500"
      case "green":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-400" : "text-red-400"
  }

  const handleStakeMore = () => {
    setToastMessage({
      type: "info",
      title: "Staking Initiated",
      message: "Preparing staking interface. Please select assets to stake.",
    })
    setShowToast(true)
  }

  const handleAssetAction = (action: string, asset: any) => {
    setToastMessage({
      type: "info",
      title: `${action} ${asset.name}`,
      message: `Preparing to ${action.toLowerCase()} ${asset.name}. This action will be available soon.`,
    })
    setShowToast(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            className="flex justify-between items-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-700 hover:bg-gray-800 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 tracking-tight">
                Portfolio
              </h1>
            </div>
            <AnimatedGradientButton
              gradientFrom="#4f46e5"
              gradientTo="#8b5cf6"
              hoverGradientFrom="#4338ca"
              hoverGradientTo="#7c3aed"
              variant="outline"
              className="border-gray-700 text-white px-3 py-2 text-sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </AnimatedGradientButton>
          </motion.div>

          {/* Portfolio Summary */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <AnimatedCard
              className="bg-gray-800/50 border-gray-700 col-span-1 lg:col-span-2"
              hoverEffect="glow"
              delay={0}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Portfolio Summary</CardTitle>
                <CardDescription className="text-gray-400">Your current DeFi portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <h3 className="text-3xl font-bold">
                      <AnimatedNumber value={portfolioData.totalBalance} /> SOL
                    </h3>
                    <p className="text-gray-400 text-sm">
                      $
                      <AnimatedNumber
                        value={portfolioData.totalBalanceUSD}
                        formatValue={(val) => val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      />
                    </p>
                  </div>
                  <div className="flex items-center justify-end">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center text-sm text-green-400"
                    >
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      <span>
                        <AnimatedNumber value={4.2} formatValue={(val) => `+${val.toFixed(1)}%`} duration={500} />
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Asset Allocation Pie Chart */}
                <div className="w-full mb-6 flex flex-col items-center">
                  <div className="w-full flex items-center justify-center mb-2">
                    <h4 className="font-medium text-gray-300">Asset Allocation</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-300">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Hover or click on a slice for details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="h-[300px] w-full max-w-md">
                    <AnimatedPieChart
                      data={portfolioData.assets}
                      innerRadius={60}
                      outerRadius={100}
                      onClick={(data) => {
                        setToastMessage({
                          type: "info",
                          title: `${data.name} Selected`,
                          message: `${data.name} represents ${data.percentage}% of your portfolio with a value of ${data.value.toLocaleString()}.`,
                        })
                        setShowToast(true)
                      }}
                    />
                  </div>
                </div>

                {/* Asset Allocation Legend */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
                  {portfolioData.assets.map((asset, index) => (
                    <motion.div
                      key={asset.id}
                      variants={itemVariants}
                      className="flex items-center gap-2 bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-colors duration-300 cursor-pointer"
                      onClick={() => toggleAssetExpand(asset.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }}></div>
                      <div>
                        <div className="text-sm font-medium">{asset.name}</div>
                        <div className="text-xs text-gray-400">{asset.percentage}%</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard className="bg-gray-800/50 border-gray-700" hoverEffect="glow" delay={1}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Staking Overview</CardTitle>
                <CardDescription className="text-gray-400">Your active staking positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioData.stakingPositions.map((position, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors duration-300"
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full ${position.color === "purple" ? "bg-purple-600" : "bg-blue-600"} flex items-center justify-center`}
                          >
                            {position.icon}
                          </div>
                          <span>{position.name}</span>
                        </div>
                        <div className="text-sm bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          +{position.apy}% APY
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Staked</span>
                          <span>Rewards</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            <AnimatedNumber value={position.staked} /> SOL
                          </span>
                          <span className="font-medium text-green-400">
                            +<AnimatedNumber value={position.rewards} /> SOL
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <AnimatedGradientButton
                    gradientFrom="#9333ea"
                    gradientTo="#4f46e5"
                    hoverGradientFrom="#7e22ce"
                    hoverGradientTo="#4338ca"
                    className="w-full py-2 text-sm mt-2"
                    onClick={handleStakeMore}
                  >
                    Stake More
                  </AnimatedGradientButton>
                </div>
              </CardContent>
            </AnimatedCard>
          </motion.div>

          {/* Assets List */}
          <AnimatedCard className="bg-gray-800/50 border-gray-700 mb-8" hoverEffect="none" delay={2}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Your Assets</CardTitle>
              <CardDescription className="text-gray-400">Detailed breakdown of your holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioData.assets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    className="border border-gray-700 rounded-lg overflow-hidden"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <div
                      className="p-4 bg-gray-700/30 flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors duration-300"
                      onClick={() => toggleAssetExpand(asset.id)}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: asset.color }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {asset.id === "sol" ? (
                            <span className="text-white font-bold">SOL</span>
                          ) : asset.id === "usdc" ? (
                            <DollarSign className="h-5 w-5 text-white" />
                          ) : (
                            <Wallet className="h-5 w-5 text-white" />
                          )}
                        </motion.div>
                        <div>
                          <h4 className="font-medium">{asset.name}</h4>
                          <p className="text-sm text-gray-400">
                            $
                            <AnimatedNumber
                              value={asset.value}
                              formatValue={(val) => val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            />
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">
                            <AnimatedNumber value={asset.amount} /> {asset.name}
                          </div>
                          <div className={`text-sm flex items-center justify-end ${getChangeColor(asset.change)}`}>
                            {asset.change >= 0 ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            <span>
                              {asset.change >= 0 ? "+" : ""}
                              {asset.change}%
                            </span>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedAsset === asset.id ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      </div>
                    </div>

                    {expandedAsset === asset.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border-t border-gray-700 bg-gray-800/30"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <motion.div
                            className="bg-gray-700/30 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-sm text-gray-400">Current Price</p>
                            <p className="font-medium">${asset.price}</p>
                          </motion.div>
                          <motion.div
                            className="bg-gray-700/30 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-sm text-gray-400">Portfolio %</p>
                            <p className="font-medium">{asset.percentage}%</p>
                          </motion.div>
                          <motion.div
                            className="bg-gray-700/30 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-sm text-gray-400">APY</p>
                            <p className="font-medium text-green-400">{asset.apy > 0 ? `+${asset.apy}%` : "—"}</p>
                          </motion.div>
                        </div>

                        {asset.staked > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-400 mb-2">Staking Details</p>
                            <motion.div
                              className="bg-gray-700/30 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm">Staked Amount</p>
                                  <p className="font-medium">
                                    <AnimatedNumber value={asset.staked} /> {asset.name}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-right">Rewards Earned</p>
                                  <p className="font-medium text-green-400 text-right">
                                    +<AnimatedNumber value={asset.rewards} /> {asset.name}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <AnimatedGradientButton
                            gradientFrom="#4f46e5"
                            gradientTo="#6366f1"
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-sm"
                            onClick={() => handleAssetAction("Buy", asset)}
                          >
                            Buy More
                          </AnimatedGradientButton>

                          {asset.staked > 0 && (
                            <AnimatedGradientButton
                              gradientFrom="#9333ea"
                              gradientTo="#8b5cf6"
                              size="sm"
                              variant="outline"
                              className="border-gray-700 text-sm"
                              onClick={() => handleAssetAction("Unstake", asset)}
                            >
                              Unstake
                            </AnimatedGradientButton>
                          )}

                          <AnimatedGradientButton
                            gradientFrom="#3b82f6"
                            gradientTo="#60a5fa"
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-sm"
                            onClick={() => handleAssetAction("Swap", asset)}
                          >
                            Swap
                          </AnimatedGradientButton>

                          <AnimatedGradientButton
                            gradientFrom="#6b7280"
                            gradientTo="#9ca3af"
                            size="sm"
                            variant="outline"
                            className="border-gray-700 ml-auto text-sm"
                            onClick={() => handleAssetAction("View", asset)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Explorer
                          </AnimatedGradientButton>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Recent Activity */}
          <AnimatedCard className="bg-gray-800/50 border-gray-700" hoverEffect="glow" delay={3}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">Your latest transactions and rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "act1", type: "stake", asset: "SOL", amount: "5", time: "2 hours ago", status: "completed" },
                  { id: "act2", type: "reward", asset: "mSOL", amount: "0.12", time: "1 day ago", status: "completed" },
                  {
                    id: "act3",
                    type: "swap",
                    asset: "USDC → SOL",
                    amount: "100",
                    time: "3 days ago",
                    status: "completed",
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start space-x-3 py-2 border-b border-gray-700 last:border-0 hover:bg-gray-800/30 rounded-lg transition-colors duration-300 p-2"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div
                      className="p-2 rounded-full bg-gray-700/50 mt-1"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {activity.type === "stake" ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : activity.type === "reward" ? (
                        <BarChart2 className="h-4 w-4 text-purple-400" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-blue-400" />
                      )}
                    </motion.div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm text-white truncate">
                          {activity.type === "stake"
                            ? `Staked ${activity.amount} ${activity.asset}`
                            : activity.type === "reward"
                              ? `Received ${activity.amount} ${activity.asset} reward`
                              : `Swapped ${activity.amount} ${activity.asset}`}
                        </h4>
                        <Badge className="bg-green-500/20 text-green-400">{activity.status}</Badge>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
                          onClick={() => {
                            setToastMessage({
                              type: "info",
                              title: "Transaction Details",
                              message: `Viewing details for ${activity.type} transaction of ${activity.amount} ${activity.asset}.`,
                            })
                            setShowToast(true)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Notification Toast */}
        <NotificationToast
          type={toastMessage.type as "success" | "error" | "info" | "warning"}
          title={toastMessage.title}
          message={toastMessage.message}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          position="bottom-right"
        />
      </main>
    </PageTransition>
  )
}
