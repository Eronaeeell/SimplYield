"use client"
import { useEffect, useState, Suspense } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"
import { useRouter } from "next/navigation"
import {
  ArrowLeft
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/ui/page-transition"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { NotificationToast } from "@/components/ui/notification-toast"
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token"
import { AnimatedPieChart } from "@/components/ui/animated-pie-chart"
import { AnimatedCard } from "@/components/ui/animated-card"
import {
  ChevronDown
} from "lucide-react"
import { fetchPortfolioPrices, fetchStakingAPY, formatPrice, formatAPY } from "@/lib/coingecko-service"

const BSOL_MINT = new PublicKey("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1")
const MSOL_MINT = new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So")

export default function PortfolioPage() {
  const router = useRouter()
  const { publicKey } = useWallet()
  const connection = new Connection("https://api.devnet.solana.com")

  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [bsolBalance, setBsolBalance] = useState(0)
  const [msolBalance, setMsolBalance] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: "success", title: "", message: "" })
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null)
  const [prices, setPrices] = useState({ sol: 0, msol: 0, bsol: 0 })
  const [apys, setApys] = useState({ sol: 0, msol: 0, bsol: 0 })

  useEffect(() => {
    const fetchAllBalances = async () => {
      if (!publicKey) return

      try {
        // Fetch all balances in parallel
        const [solLamports, bsolResult, msolResult] = await Promise.all([
          connection.getBalance(publicKey),
          getAssociatedTokenAddress(BSOL_MINT, publicKey)
            .then(ata => getAccount(connection, ata))
            .catch(() => null),
          connection.getParsedTokenAccountsByOwner(publicKey, { mint: MSOL_MINT })
            .catch(() => ({ value: [] }))
        ])

        setSolBalance(solLamports / 1e9)
        setBsolBalance(bsolResult ? Number(bsolResult.amount) / 1e9 : 0)
        
        if (msolResult.value.length > 0) {
          const amount = msolResult.value[0].account.data.parsed.info.tokenAmount.uiAmount
          setMsolBalance(amount ?? 0)
        } else {
          setMsolBalance(0)
        }
      } catch (err) {
        console.error('Failed to fetch balances:', err)
      }
    }

    fetchAllBalances()
  }, [publicKey])



  // Fetch prices and APY from CoinGecko
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const [priceData, apyData] = await Promise.all([
          fetchPortfolioPrices(),
          fetchStakingAPY(),
        ])
        setPrices(priceData)
        setApys(apyData)
      } catch (error) {
        console.error("Error fetching price data:", error)
      }
    }

    fetchPriceData()
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPriceData, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleGoBack = () => router.back()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const [priceData, apyData] = await Promise.all([
        fetchPortfolioPrices(),
        fetchStakingAPY(),
      ])
      setPrices(priceData)
      setApys(apyData)
      
      setToastMessage({
        type: "success",
        title: "Refreshed",
        message: "Portfolio updated successfully.",
      })
      setShowToast(true)
    } catch (error) {
      console.error("Error refreshing:", error)
      setToastMessage({
        type: "error",
        title: "Failed",
        message: "Unable to refresh data.",
      })
      setShowToast(true)
    } finally {
      setIsRefreshing(false)
    }
  }

  const totalBalance = (solBalance ?? 0) + bsolBalance + msolBalance
  
  // Calculate total portfolio value in USD
  const totalValueUSD = 
    (solBalance ?? 0) * prices.sol +
    bsolBalance * prices.bsol +
    msolBalance * prices.msol

const portfolioAssets = [
  {
    id: "sol",
    name: "SOL",
    value: solBalance ?? 0,
    price: prices.sol,
    apy: apys.sol,
    color: "#8b5cf6",
    percentage: parseFloat((((solBalance ?? 0) / totalBalance) * 100).toFixed(2)),
    valueUSD: (solBalance ?? 0) * prices.sol,
  },
  {
    id: "bsol",
    name: "bSOL",
    value: bsolBalance,
    price: prices.bsol,
    apy: apys.bsol,
    color: "#38bdf8",
    percentage: parseFloat(((bsolBalance / totalBalance) * 100).toFixed(2)),
    valueUSD: bsolBalance * prices.bsol,
  },
  {
    id: "msol",
    name: "mSOL",
    value: msolBalance,
    price: prices.msol,
    apy: apys.msol,
    color: "#22c55e",
    percentage: parseFloat(((msolBalance / totalBalance) * 100).toFixed(2)),
    valueUSD: msolBalance * prices.msol,
  },
]

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Button variant="ghost" size="icon" className="rounded-lg hover:bg-gray-800" onClick={handleGoBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Portfolio
            </h1>
          </motion.div>

          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" initial="hidden" animate={isLoaded ? "visible" : "hidden"} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
            {/* Total Balance - Transparent Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="p-6 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Total Balance</p>
                <div className="flex items-baseline gap-3 mb-1">
                  <h3 className="text-5xl font-bold">
                    <AnimatedNumber value={totalBalance} formatValue={(val) => val.toFixed(2)} />
                  </h3>
                  <p className="text-2xl text-gray-500">SOL</p>
                </div>
                <p className="text-gray-400 text-xl mt-2">
                  $<AnimatedNumber value={totalValueUSD} formatValue={(val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
                </p>

                {/* Asset Allocation Chart */}
                <div className="mt-6">
                  <h4 className="text-sm text-gray-400 mb-2 text-center">Asset Allocation</h4>
                  <div className="h-[280px] w-full">
                    <AnimatedPieChart
                      data={portfolioAssets}
                      innerRadius={60}
                      outerRadius={100}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    {portfolioAssets.map((asset) => (
                      <div key={asset.id} className="flex items-center gap-2 bg-gray-800/30 rounded px-3 py-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }}></div>
                        <span className="text-sm font-medium">{asset.name}</span>
                        <span className="text-xs text-gray-400">{asset.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Assets Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <AnimatedCard className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full" hoverEffect="none" delay={0}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold">Assets</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">Your token holdings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide">
                {portfolioAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    className="border border-gray-700 rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
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
                            <p className="text-sm font-medium">{asset.percentage}%</p>
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
                  </motion.div>
                ))}
              </div>
            </CardContent>
              </AnimatedCard>
            </motion.div>
          </motion.div>
        </div>

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