"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/ui/page-transition"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AnimatedGradientButton } from "@/components/ui/animated-gradient-button"
import { NotificationToast } from "@/components/ui/notification-toast"

const STAKE_PROGRAM_ID = new PublicKey("Stake11111111111111111111111111111111111111")

export default function PortfolioPage() {
  const router = useRouter()
  const { publicKey } = useWallet()
  const connection = new Connection("https://api.devnet.solana.com")

  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [stakeAccounts, setStakeAccounts] = useState<
    { voteAccountAddress: string; sol: number; status: string }[]
  >([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: "success", title: "", message: "" })

  // Fetch SOL balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        const lamports = await connection.getBalance(publicKey)
        setSolBalance(lamports / 1e9)
      }
    }
    fetchBalance()
  }, [publicKey])

  // Fetch stake accounts
  useEffect(() => {
    const fetchStakeAccounts = async () => {
      if (!publicKey) return

      const accounts = await connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 12, // authorized staker
              bytes: publicKey.toBase58(),
            },
          },
        ],
      })

      const stakes = accounts.map((account) => {
  const lamports = account.account.lamports;
  const sol = lamports / 1e9;

  let voteAccountAddress = "N/A";
  let status = "Unknown";

  if (
    account.account.data &&
    typeof account.account.data === "object" &&
    "parsed" in account.account.data
  ) {
    const parsed = (account.account.data as any).parsed;
    const info = parsed?.info;

    if (info?.stake?.delegation?.voter) {
      voteAccountAddress = info.stake.delegation.voter;
      status = "Activating";
    } else if (info?.meta) {
      status = "Initialized";
    } else {
      status = "Inactive";
    }
  }

  return {
    voteAccountAddress,
    sol,
    status,
  };
});



      setStakeAccounts(stakes)
    }

    fetchStakeAccounts()
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
                className="rounded-full border-gray-700 hover:bg-gray-800"
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

          {/* Balance Summary */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {/* SOL Balance Card */}
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Wallet Balance</CardTitle>
                <CardDescription className="text-gray-400">Live SOL balance</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-3xl font-bold">
                  <AnimatedNumber value={solBalance ?? 0} /> SOL
                </h3>
              </CardContent>
            </motion.div>

            {/* Staking Overview */}
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
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
                    <div
                      key={i}
                      className="flex justify-between items-center bg-gray-700/40 rounded-lg px-3 py-2"
                    >
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
        </div>

        {/* Toast */}
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
