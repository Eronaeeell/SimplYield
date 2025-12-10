"use client"

import { useState, useEffect, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { ChatInterface } from "@/components/chat-interface"
import { NotificationToast } from "@/components/ui/notification-toast"
import { PageTransition } from "@/components/ui/page-transition"
import { Shield, Sparkles, MessageSquare, Wallet, BarChart2, RefreshCcw } from "lucide-react"
import { TransactionHistory } from "@/components/transaction-history"
import { MiniNotification } from "@/components/ui/mini-notification"
import { useConnection } from "@solana/wallet-adapter-react"

export default function Home() {
  const router = useRouter()
  const { connected, publicKey, connect, disconnect, sendTransaction, signTransaction } = useWallet()
  const { connection } = useConnection()

  const [walletAddress, setWalletAddress] = useState<string>("")
  const [transactions, setTransactions] = useState<any[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [notification, setNotification] = useState({ type: "success", title: "", message: "" })

  const [showMiniNotif, setShowMiniNotif] = useState(false)
  const [receivedAmount, setReceivedAmount] = useState(0)
  const prevTxSignatures = useRef<string[]>([])

  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toString())
    } else {
      setWalletAddress("")
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (!connected || !publicKey) return

    const processedSigs = new Set<string>()

    const interval = setInterval(async () => {
      try {
        const sigs = await connection.getSignaturesForAddress(publicKey, { limit: 5 })

        for (const sig of sigs) {
          if (processedSigs.has(sig.signature)) continue // skip if already processed

          const tx = await connection.getParsedTransaction(sig.signature, { commitment: "confirmed" })
          const instructions = tx?.transaction.message.instructions || []

          for (const ix of instructions) {
            if ("parsed" in ix && ix.program === "system") {
              const parsed = ix.parsed as any
              if (parsed?.type === "transfer" && parsed.info?.destination === publicKey.toBase58()) {
                const lamports = parsed.info.lamports
                const sol = lamports / 1_000_000_000

                // Trigger the popup
                setReceivedAmount(sol)
                setShowMiniNotif(true)
              }
            }
          }

          // Mark this signature as processed
          processedSigs.add(sig.signature)
        }
      } catch (err) {
        console.error("Error checking incoming transactions:", err)
      }
    }, 10_000)

    return () => clearInterval(interval)
  }, [connected, publicKey])


  const handleConnectWallet = () => {
    connect().catch(() => {
      setNotification({
        type: "error",
        title: "Wallet Connection Failed",
        message: "Please try again later.",
      })
      setShowNotification(true)
    })
  }

  if (connected) {
    return (
      <PageTransition>
        <main className="flex min-h-screen flex-col bg-gray-900">
          <motion.header className="backdrop-blur-md bg-gray-900/80 border-b border-gray-700/50 sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
              <div className="flex justify-between items-center">
                {/* Logo */}
                <motion.h1 
                  className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 text-transparent bg-clip-text"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="font-extrabold">Simpl</span>Yield
                </motion.h1>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                  {/* Portfolio Button */}
                  <motion.button
                    onClick={() => router.push("/portfolio")}
                    className="px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800/50 text-gray-300 text-sm font-medium hover:border-purple-500/50 hover:bg-gray-800/80 flex items-center gap-2 backdrop-blur-sm transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Portfolio</span>
                  </motion.button>

                  {/* Wallet Address Badge */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/80 border border-gray-700/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs md:text-sm text-gray-300 font-mono">
                        {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}
                      </span>
                    </div>
                  </div>

                  {/* Disconnect Button */}
                  <motion.button
                    className="px-4 py-2 rounded-xl bg-red-600/90 text-white text-sm font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                    onClick={disconnect}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="hidden sm:inline">Disconnect</span>
                    <span className="sm:hidden">✕</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.header>

          <motion.div className="container mx-auto p-4 flex flex-col items-center gap-6 flex-grow max-w-5xl">
            <motion.div className="w-full">
              <ChatInterface/>
            </motion.div>

            <motion.div className="w-full max-w-xl">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-medium text-white">Recent Transactions</h3>
                  <button
                    onClick={() => {
                      // Trigger refresh via custom event
                      window.dispatchEvent(new CustomEvent('refresh-transactions'));
                    }}
                    className="flex items-center justify-center text-white border border-blue-600 rounded-full px-3 py-1 text-sm hover:bg-blue-600/20 transition-colors"
                  >
                    <RefreshCcw className="h-3 w-3 mr-1" /> Refresh
                  </button>
                </div>
                <TransactionHistory />
              </div>
            </motion.div>
          </motion.div>

          <NotificationToast
            type={notification.type as "success" | "error" | "info" | "warning"}
            title={notification.title}
            message={notification.message}
            isVisible={showNotification}
            onClose={() => setShowNotification(false)}
            position="top-right"
          />

          <MiniNotification
            isVisible={showMiniNotif}
            amount={receivedAmount}
            onClose={() => setShowMiniNotif(false)}
            wallet={{ publicKey, signTransaction, sendTransaction }}
            connection={connection} // pass only what is needed
          />

        </main>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="relative min-h-screen flex items-center">
          <div className="container mx-auto px-4 py-12 relative z-10">
            <motion.div
              className="flex flex-col items-center text-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 text-transparent bg-clip-text">
                <span className="font-extrabold">Simpl</span>Yield
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                SimplYield transforms complex DeFi operations into simple conversations.
              </p>
              <motion.div className="flex flex-col sm:flex-row justify-center gap-4">
                <WalletMultiButton className="px-4 py-2 rounded-lg text-base shadow-lg bg-purple-600 hover:bg-purple-700 transition" onClick={handleConnectWallet}>
                  Connect Wallet
                </WalletMultiButton>
                <button
                  className="px-4 py-2 rounded-lg text-base bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition"
                  onClick={() => router.push("/demo")}
                >
                  See Demo
                </button>
              </motion.div>
              <div className="flex justify-center items-center text-sm text-gray-400 mt-2">
                <Shield className="h-4 w-4 mr-2 text-gray-500" />
                Your assets remain in your control at all times
              </div>
              <motion.div className="mt-10 relative mx-auto max-w-md w-full">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-40"></div>
                <div className="relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
                  <div className="p-3 border-b border-gray-700 flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <div className="ml-2 text-sm text-gray-400">SimplYield Chat</div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 text-sm">
                        Hello! I'm your DeFi assistant. How can I help you today?
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <div className="bg-purple-600 rounded-lg p-3 text-sm text-white">
                        Stake 5 SOL to earn yield
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 text-sm">
                        Processing your request to stake 5 SOL. Transaction initiated...
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-700 bg-gray-800/70">
                    <div className="flex bg-gray-700 rounded-lg px-3 py-2 text-gray-400 text-sm">
                      Type a message or command...
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-lg text-sm text-green-400 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1.5" /> Simple Commands
                </div>
                <div className="absolute -left-4 -bottom-4 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-lg text-sm text-purple-400 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1.5" /> Real-time Execution
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
