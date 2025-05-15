"use client"
import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  RefreshCw,
  Info,
  TrendingUp
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/ui/page-transition"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedGradientButton } from "@/components/ui/animated-gradient-button"
import { NotificationToast } from "@/components/ui/notification-toast"
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token"
import { AnimatedPieChart } from "@/components/ui/animated-pie-chart"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AnimatedCard } from "@/components/ui/animated-card"
import {
  ChevronDown,
  ExternalLink
} from "lucide-react"


const STAKE_PROGRAM_ID = new PublicKey("Stake11111111111111111111111111111111111111")
const BSOL_MINT = new PublicKey("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1")
const MSOL_MINT = new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So")

export default function PortfolioPage() {
  const router = useRouter()
  const { publicKey } = useWallet()
  const connection = new Connection("https://api.devnet.solana.com")

  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [stakeAccounts, setStakeAccounts] = useState<
    { voteAccountAddress: string; sol: number; status: string }[]
  >([])
  const [bsolBalance, setBsolBalance] = useState(0)
  const [msolBalance, setMsolBalance] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: "success", title: "", message: "" })
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null)
  const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        const lamports = await connection.getBalance(publicKey)
        setSolBalance(lamports / 1e9)
      }
    }
    fetchBalance()
  }, [publicKey])

  useEffect(() => {
    const fetchStakeAccounts = async () => {
      if (!publicKey) return

      const accounts = await connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 12,
              bytes: publicKey.toBase58(),
            },
          },
        ],
      })

      const stakes = accounts.map((account) => {
        const lamports = account.account.lamports
        const sol = lamports / 1e9

        let voteAccountAddress = "N/A"
        let status = "Unknown"

        if (
          account.account.data &&
          typeof account.account.data === "object" &&
          "parsed" in account.account.data
        ) {
          const parsed = (account.account.data as any).parsed
          const info = parsed?.info

          if (info?.stake?.delegation?.voter) {
            voteAccountAddress = info.stake.delegation.voter
            status = "Activating"
          } else if (info?.meta) {
            status = "Initialized"
          } else {
            status = "Inactive"
          }
        }

        return {
          voteAccountAddress,
          sol,
          status,
        }
      })

      setStakeAccounts(stakes)
    }

    fetchStakeAccounts()
  }, [publicKey])

  useEffect(() => {
    const fetchLiquidStakingBalances = async () => {
      if (!publicKey) return

      try {
        const bsolAta = await getAssociatedTokenAddress(BSOL_MINT, publicKey)
        const bsolAccount = await getAccount(connection, bsolAta)
        setBsolBalance(Number(bsolAccount.amount) / 1e9)
      } catch {
        setBsolBalance(0)
      }

      try {
        const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: MSOL_MINT,
        })

        if (accounts.value.length > 0) {
          const amount = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
          setMsolBalance(amount ?? 0)
        } else {
          setMsolBalance(0)
        }
      } catch (err) {
        console.error("Failed to fetch mSOL:", err)
        setMsolBalance(0)
      }
    }

    fetchLiquidStakingBalances()
  }, [publicKey])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleGoBack = () => router.back()

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setToastMessage({
        type: "success",
        title: "Data Refreshed",
        message: "Your portfolio has been updated.",
      })
      setShowToast(true)
    }, 1500)
  }

  const totalStaked = stakeAccounts.reduce((sum, s) => sum + s.sol, 0)
  const totalBalance = (solBalance ?? 0) + bsolBalance + msolBalance

const portfolioAssets = [
  {
    id: "sol",
    name: "SOL",
    value: solBalance ?? 0,
    color: "#8b5cf6",
    percentage: parseFloat((((solBalance ?? 0) / totalBalance) * 100).toFixed(2)),
  },
  {
    id: "bsol",
    name: "bSOL",
    value: bsolBalance,
    color: "#38bdf8",
    percentage: parseFloat(((bsolBalance / totalBalance) * 100).toFixed(2)),
  },
  {
    id: "msol",
    name: "mSOL",
    value: msolBalance,
    color: "#22c55e",
    percentage: parseFloat(((msolBalance / totalBalance) * 100).toFixed(2)),
  },
]

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <motion.div className="flex justify-between items-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-full border-gray-700 hover:bg-gray-800" onClick={handleGoBack}>
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

          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" initial="hidden" animate={isLoaded ? "visible" : "hidden"} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
            <motion.div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Portfolio Summary</CardTitle>
                <CardDescription className="text-gray-400">Your current DeFi portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <h3 className="text-3xl font-bold">
                      <AnimatedNumber value={totalBalance} /> SOL
                    </h3>
                    <p className="text-gray-400 text-sm">
                      $<AnimatedNumber value={totalBalance * 100} formatValue={(val) => val.toFixed(2)} />
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

                {/* Pie Chart with Tooltip */}
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
                      data={portfolioAssets}
                      innerRadius={60}
                      outerRadius={100}
                      onClick={(data) => {
                        setToastMessage({
                          type: "info",
                          title: `${data.name} Selected`,
                          message: `${data.name} makes up ${data.percentage}% of your portfolio.`,
                        })
                        setShowToast(true)
                      }}
                    />
                  </div>
                </div>

                {/* Asset Allocation Legend */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl mx-auto">
                  {portfolioAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center gap-2 bg-gray-700/30 rounded-lg p-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }}></div>
                      <div>
                        <div className="text-sm font-medium">{asset.name}</div>
                        <div className="text-xs text-gray-400">{asset.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </motion.div>

            <motion.div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Staking Overview</CardTitle>
                <CardDescription className="text-gray-400">Native stake accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold mb-2">
                  <AnimatedNumber value={totalStaked} /> SOL staked
                </p>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {stakeAccounts.map((stake, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-700/40 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">
                          {stake.voteAccountAddress.slice(0, 4)}...{stake.voteAccountAddress.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-400">{stake.status}</p>
                      </div>
                      <p className="text-sm font-semibold">{stake.sol.toFixed(2)} SOL</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          </motion.div>
          <AnimatedCard className="bg-gray-800/50 border-gray-700 mb-8" hoverEffect="none" delay={2}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Your Assets</CardTitle>
              <CardDescription className="text-gray-400">Detailed breakdown of your holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioAssets.map((asset, index) => (
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
                      onClick={() => setExpandedAsset(asset.id === expandedAsset ? null : asset.id)}
                    >
                      <div className="flex items-center gap-3">
                        <img src={`/tokens/${asset.id}.svg`} alt={asset.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <h4 className="font-medium">{asset.name}</h4>
                          <p className="text-sm text-gray-400">
                            <AnimatedNumber value={asset.value * 100} formatValue={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">
                            <AnimatedNumber value={asset.value} /> {asset.name}
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
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border-t border-gray-700 bg-gray-800/30"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-700/30 p-3 rounded-lg">
                            <p className="text-sm text-gray-400">Current Price</p>
                            <p className="font-medium">$100</p>
                          </div>
                          <div className="bg-gray-700/30 p-3 rounded-lg">
                            <p className="text-sm text-gray-400">Portfolio %</p>
                            <p className="font-medium">{asset.percentage}%</p>
                          </div>
                          <div className="bg-gray-700/30 p-3 rounded-lg">
                            <p className="text-sm text-gray-400">APY</p>
                            <p className="font-medium text-green-400">
                              {asset.id === 'sol' ? '+5.8%' : asset.id === 'msol' ? '+6.2%' : asset.id === 'bsol' ? '+7.0%' : '—'}
                            </p>
                          </div>
                        </div>

                        <div className="mb-2">
                          <p className="text-sm text-gray-400 mb-2">Staking Details</p>
                          <div className="bg-gray-700/30 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm">Staked Amount</p>
                                <p className="font-medium">
                                  <AnimatedNumber value={asset.value} /> {asset.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-right">Rewards Earned</p>
                                <p className="font-medium text-green-400 text-right">—</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
</AnimatedCard>
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