"use client"
import { useEffect, useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { X, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedPieChart } from "@/components/ui/animated-pie-chart"
import { AnimatedCard } from "@/components/ui/animated-card"
import { formatPrice, formatAPY } from "@/lib/coingecko-service"
import { getUserPortfolio, PortfolioData } from "@/lib/portfolio-service"

interface PortfolioSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function PortfolioSidebar({ isOpen, onClose }: PortfolioSidebarProps) {
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!publicKey || !connection) {
        setPortfolioData(null)
        return
      }

      setIsLoading(true)
      try {
        const portfolio = await getUserPortfolio(connection, publicKey)
        setPortfolioData(portfolio)
      } catch (error) {
        console.error('Failed to fetch portfolio:', error)
        setPortfolioData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolio()
    // Refresh every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000)
    return () => clearInterval(interval)
  }, [publicKey, connection])

  const totalBalance = portfolioData?.totalSOLEquivalent ?? 0
  const totalValueUSD = portfolioData?.totalValueUSD ?? 0

  const portfolioAssets = portfolioData?.assets.map(asset => ({
    id: asset.symbol.toLowerCase(),
    name: asset.symbol === 'SOL' ? 'SOL (Liquidity)' : asset.symbol === 'STAKED_SOL' ? 'SOL' : asset.symbol,
    value: asset.amount,
    price: asset.priceUSD,
    apy: asset.apy ?? 0,
    color: asset.symbol === 'SOL' ? '#8b5cf6' : 
           asset.symbol === 'STAKED_SOL' ? '#6b7280' :
           asset.symbol === 'bSOL' ? '#f97316' : 
           asset.symbol === 'mSOL' ? '#22c55e' : 
           asset.symbol === 'jitoSOL' ? '#3b82f6' : '#6b7280',
    percentage: asset.percentage,
    valueUSD: asset.valueUSD,
  })) ?? []

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-[73px] h-[calc(100vh-73px)] w-full md:w-[500px] bg-gray-900 border-l border-gray-800 z-50 overflow-y-auto scrollbar-hide shadow-2xl"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Portfolio</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-lg hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Total Balance */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Total Balance</p>
                <div className="flex items-baseline gap-3 mb-1">
                  <h3 className="text-4xl font-bold">
                    <AnimatedNumber value={totalBalance} formatValue={(val) => val.toFixed(2)} />
                  </h3>
                  <p className="text-xl text-gray-500">SOL</p>
                </div>
                <p className="text-gray-400 text-lg">
                  $<AnimatedNumber value={totalValueUSD} formatValue={(val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
                </p>
              </div>

              {/* Asset Allocation Chart */}
              <div className="mb-6">
                <h4 className="text-sm text-gray-400 mb-3 text-center">Asset Allocation</h4>
                <div className="h-[240px] w-full">
                  <AnimatedPieChart
                    data={portfolioAssets}
                    innerRadius={50}
                    outerRadius={90}
                  />
                </div>
                <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                  {portfolioAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center gap-2 bg-gray-800/30 rounded px-2.5 py-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.color }}></div>
                      <span className="text-xs font-medium">{asset.name}</span>
                      <span className="text-xs text-gray-400">{asset.percentage.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assets List */}
              <div>
                <h3 className="text-lg font-bold mb-3">Assets</h3>
                <div className="space-y-3">
                  {portfolioAssets.map((asset, index) => (
                    <motion.div
                      key={asset.id}
                      className="border border-gray-700 rounded-lg overflow-hidden"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        className="p-3 bg-gray-800/30 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
                        onClick={() => setExpandedAsset(asset.id === expandedAsset ? null : asset.id)}
                      >
                        <div className="flex items-center gap-3">
                          <img src={`/tokens/${asset.id}.svg`} alt={asset.name} className="w-10 h-10 rounded-full" />
                          <div>
                            <h4 className="font-medium text-white">{asset.name}</h4>
                            <p className="text-sm text-gray-400">
                              <AnimatedNumber value={asset.value} formatValue={(val) => val.toFixed(4)} /> {asset.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-medium text-white">
                              $<AnimatedNumber value={asset.valueUSD} formatValue={(val) => val.toFixed(2)} />
                            </div>
                            <div className="text-xs text-green-400">{formatAPY(asset.apy)}</div>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedAsset === asset.id ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </motion.div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedAsset === asset.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-3 border-t border-gray-700 bg-gray-900/30"
                          >
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-gray-800/50 p-2.5 rounded border border-gray-700/50">
                                <p className="text-xs text-gray-400 mb-1">Price</p>
                                <p className="text-sm font-medium">
                                  ${formatPrice(asset.price)}
                                </p>
                              </div>
                              <div className="bg-gray-800/50 p-2.5 rounded border border-gray-700/50">
                                <p className="text-xs text-gray-400 mb-1">Share</p>
                                <p className="text-sm font-medium">{asset.percentage.toFixed(2)}%</p>
                              </div>
                              <div className="bg-gray-800/50 p-2.5 rounded border border-gray-700/50">
                                <p className="text-xs text-gray-400 mb-1">APY</p>
                                <p className="text-sm font-medium text-green-400">
                                  {formatAPY(asset.apy)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
