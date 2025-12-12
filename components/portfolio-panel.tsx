"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, BarChart2, PieChart, Loader2 } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { getUserPortfolio, PortfolioData } from "@/lib/portfolio-service"

export function PortfolioPanel() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
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
    // Refresh portfolio every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000)
    return () => clearInterval(interval)
  }, [publicKey, connection])

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800/50 border-gray-700 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Portfolio Overview</CardTitle>
          <CardDescription className="text-gray-400">Your current DeFi portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !publicKey ? (
            <div className="text-center py-12 text-gray-400">
              <p>Connect your wallet to view your portfolio</p>
            </div>
          ) : !portfolioData || portfolioData.assets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No assets found in your wallet</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <h3 className="text-3xl font-bold">{portfolioData.totalSOLEquivalent.toFixed(2)} SOL</h3>
                  <p className="text-gray-400 text-sm">${portfolioData.totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 text-sm">Updated: {new Date(portfolioData.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-300">Asset Allocation</h4>

                {portfolioData.assets.map((asset, index) => {
                  // Assign colors based on token symbol
                  const getColor = (symbol: string) => {
                    switch (symbol) {
                      case 'SOL': return 'bg-purple-500'
                      case 'STAKED_SOL': return 'bg-gray-500'
                      case 'mSOL': return 'bg-green-500'
                      case 'bSOL': return 'bg-orange-500'
                      case 'jitoSOL': return 'bg-blue-500'
                      default: return 'bg-gray-500'
                    }
                  }

                  const getDisplayName = (symbol: string) => {
                    if (symbol === 'SOL') return 'SOL (Liquidity)';
                    if (symbol === 'STAKED_SOL') return 'SOL';
                    return symbol;
                  }

                  return (
                    <div key={asset.symbol} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getColor(asset.symbol)}`}></div>
                          <span>{getDisplayName(asset.symbol)}</span>
                          {asset.apy && (
                            <span className="text-xs text-green-400">
                              {asset.apy.toFixed(2)}% APY
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-right">
                          <div>
                            {asset.amount.toFixed(4)} {asset.symbol}
                          </div>
                          <div className="text-gray-400">
                            ${asset.valueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={asset.percentage} className="h-1.5" />
                        <span className="text-xs text-gray-400">{asset.percentage.toFixed(2)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {portfolioData && portfolioData.assets.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">Staking Overview</CardTitle>
            <CardDescription className="text-gray-400">Your active staking positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Liquid Staking Tokens */}
              {portfolioData.assets.filter(a => ['mSOL', 'bSOL', 'jitoSOL'].includes(a.symbol)).length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        <BarChart2 className="h-4 w-4 text-white" />
                      </div>
                      <span>Liquid Staking</span>
                    </div>
                    <div className="text-sm bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                      {(() => {
                        const liquidTokens = portfolioData.assets.filter(a => ['mSOL', 'bSOL', 'jitoSOL'].includes(a.symbol))
                        const totalValue = liquidTokens.reduce((sum, a) => sum + a.valueUSD, 0)
                        const weightedAPY = liquidTokens.reduce((sum, a) => sum + (a.apy || 0) * a.valueUSD, 0) / totalValue
                        return `+${weightedAPY.toFixed(2)}% APY`
                      })()}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Staked</span>
                      <span>Value</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {portfolioData.assets
                          .filter(a => ['mSOL', 'bSOL', 'jitoSOL'].includes(a.symbol))
                          .reduce((sum, a) => sum + a.amount, 0)
                          .toFixed(4)} tokens
                      </span>
                      <span className="font-medium text-green-400">
                        ${portfolioData.assets
                          .filter(a => ['mSOL', 'bSOL', 'jitoSOL'].includes(a.symbol))
                          .reduce((sum, a) => sum + a.valueUSD, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Native SOL */}
              {portfolioData.assets.find(a => a.symbol === 'SOL') && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <PieChart className="h-4 w-4 text-white" />
                      </div>
                      <span>Native SOL</span>
                    </div>
                    {portfolioData.assets.find(a => a.symbol === 'SOL')?.apy && (
                      <div className="text-sm bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                        +{portfolioData.assets.find(a => a.symbol === 'SOL')?.apy?.toFixed(2)}% APY
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Balance</span>
                      <span>Value</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {portfolioData.assets.find(a => a.symbol === 'SOL')?.amount.toFixed(4)} SOL
                      </span>
                      <span className="font-medium text-blue-400">
                        ${portfolioData.assets.find(a => a.symbol === 'SOL')?.valueUSD.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
