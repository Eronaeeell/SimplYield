"use client"

import { useState, useEffect, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { ChatInterface } from "@/components/chat-interface"
import { NotificationToast } from "@/components/ui/notification-toast"
import { PageTransition } from "@/components/ui/page-transition"
import { Shield, Sparkles, MessageSquare, Wallet, BarChart2 } from "lucide-react"
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
          <motion.header className="border-b border-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 text-transparent bg-clip-text">
                <span className="font-extrabold">Simpl</span>Yield
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm text-gray-300 font-medium">
                    {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}
                  </span>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-base bg-red-600 text-white hover:bg-red-700"
                  onClick={disconnect}
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </motion.header>

          <motion.div className="container mx-auto p-4 flex flex-col lg:flex-row gap-4 flex-grow">
            <motion.div className="flex-1 flex flex-col min-w-0">
              <ChatInterface/>

              <div className="block lg:hidden space-y-4 mt-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition duration-300"></div>
                  <button
                    onClick={() => router.push("/portfolio")}
                    className="relative w-full py-3 px-5 text-base font-semibold flex items-center justify-center gap-3 rounded-xl z-10 overflow-hidden border border-purple-500/40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-purple-800 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-purple-500/20"
                  >
                    <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-inner shadow-white/10">
                      <BarChart2 className="h-4 w-4 text-white animate-pulse" />
                      <div className="absolute h-1.5 w-1.5 rounded-full bg-blue-400 animate-orbit opacity-70" />
                    </div>
                    <span className="text-white tracking-wide">View Portfolio</span>
                  </button>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div className="p-4 border-b border-gray-700 flex items-center">
                    <h3 className="font-medium text-white">Recent Transactions</h3>
                  </div>
                  <TransactionHistory />
                </div>
              </div>
            </motion.div>

            <motion.div className="hidden lg:block w-full lg:w-[28rem] space-y-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition duration-300"></div>
                <button
                  onClick={() => router.push("/portfolio")}
                  className="relative w-full py-3 px-5 text-base font-semibold flex items-center justify-center gap-3 rounded-xl z-10 overflow-hidden border border-purple-500/40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-purple-800 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-purple-500/20"
                >
                  <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-inner shadow-white/10">
                    <BarChart2 className="h-4 w-4 text-white animate-pulse" />
                    <div className="absolute h-1.5 w-1.5 rounded-full bg-blue-400 animate-orbit opacity-70" />
                  </div>
                  <span className="text-white tracking-wide">View Portfolio</span>
                </button>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-700 flex items-center">
                  <h3 className="font-medium text-white">Recent Transactions</h3>
                </div>
                <TransactionHistory/>
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
