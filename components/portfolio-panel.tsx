"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, BarChart2, PieChart } from "lucide-react"

export function PortfolioPanel() {
  const portfolioData = {
    totalBalance: 245.32,
    totalBalanceUSD: 24532.0,
    assets: [
      { name: "SOL", amount: 145.62, value: 14562.0, percentage: 59.4, change: 2.3 },
      { name: "USDC", amount: 5500, value: 5500.0, percentage: 22.4, change: 0.1 },
      { name: "mSOL", amount: 40.8, value: 4080.0, percentage: 16.6, change: 1.8 },
      { name: "Other", amount: 1, value: 390.0, percentage: 1.6, change: -0.5 },
    ],
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800/50 border-gray-700 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Portfolio Overview</CardTitle>
          <CardDescription className="text-gray-400">Your current DeFi portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <h3 className="text-3xl font-bold">{portfolioData.totalBalance} SOL</h3>
              <p className="text-gray-400 text-sm">${portfolioData.totalBalanceUSD.toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center text-sm text-green-400">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                <span>+4.2%</span>
              </div>
              <span className="text-gray-500 text-sm">24h</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">Asset Allocation</h4>

            {portfolioData.assets.map((asset, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0
                          ? "bg-purple-500"
                          : index === 1
                            ? "bg-blue-500"
                            : index === 2
                              ? "bg-green-500"
                              : "bg-gray-500"
                      }`}
                    ></div>
                    <span>{asset.name}</span>
                  </div>
                  <div className="text-sm text-right">
                    <div>
                      {asset.amount} {asset.name}
                    </div>
                    <div className="text-gray-400">${asset.value.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={asset.percentage} className="h-1.5" />
                  <span className="text-xs text-gray-400">{asset.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Staking Overview</CardTitle>
          <CardDescription className="text-gray-400">Your active staking positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <BarChart2 className="h-4 w-4 text-white" />
                  </div>
                  <span>Liquid Staking</span>
                </div>
                <div className="text-sm bg-green-500/20 text-green-400 px-2 py-0.5 rounded">+5.2% APY</div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Staked</span>
                  <span>Rewards</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">102.5 SOL</span>
                  <span className="font-medium text-green-400">+1.25 SOL</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <PieChart className="h-4 w-4 text-white" />
                  </div>
                  <span>Yield Farming</span>
                </div>
                <div className="text-sm bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">+8.7% APY</div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Deposited</span>
                  <span>Rewards</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">43.1 SOL</span>
                  <span className="font-medium text-blue-400">+0.92 SOL</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
