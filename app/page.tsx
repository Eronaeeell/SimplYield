"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Wallet, MessageSquare, ArrowRight, Shield, BarChart2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChatInterface } from "@/components/chat-interface"
import { TransactionHistory } from "@/components/transaction-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedGradientButton } from "@/components/ui/animated-gradient-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { PageTransition } from "@/components/ui/page-transition"
import { NotificationToast } from "@/components/ui/notification-toast"

export default function Home() {
  const router = useRouter()
  const [walletConnected, setWalletConnected] = useState(false)
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState("phantom")
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [transactions, setTransactions] = useState<any[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [notification, setNotification] = useState({ type: "success", title: "", message: "" })
  const [showWalletMenu, setShowWalletMenu] = useState(false)

  // Handle wallet connection
  const handleConnectWallet = () => {
    setConnectingWallet(true)
    // Simulate wallet connection
    setTimeout(() => {
      setConnectingWallet(false)
      setWalletModalOpen(false)
      setWalletConnected(true)
      setWalletAddress("8xzt7aqNRNVr9WzJYgfQXEMJMZg2bxaNRZqVYwSxcs7S")

      // Show notification
      setNotification({
        type: "success",
        title: "Wallet Connected",
        message: "Your wallet has been successfully connected to SimplYield.",
      })
      setShowNotification(true)
    }, 1500)
  }

  // Simulate a transaction when message is about staking
  const handleMessageSubmit = (message: string) => {
    if (message.toLowerCase().includes("stake")) {
      const amount = message.match(/\d+/)?.[0] || "0"
      const coin = message.toLowerCase().includes("sol") ? "SOL" : "ETH"

      // Create transaction object
      const newTransaction = {
        id: Date.now().toString(),
        type: "stake",
        amount: amount,
        coin: coin,
        status: "processing",
        timestamp: new Date().toISOString(),
      }

      // Show processing notification
      setNotification({
        type: "info",
        title: "Transaction Processing",
        message: `Staking ${amount} ${coin}...`,
      })
      setShowNotification(true)

      // Update transaction after 2 seconds
      setTimeout(() => {
        newTransaction.status = "completed"
        setTransactions((prev) => [newTransaction, ...prev])

        // Show success notification
        setNotification({
          type: "success",
          title: "Transaction Completed",
          message: `Successfully staked ${amount} ${coin}`,
        })
        setShowNotification(true)
      }, 2000)
    }
  }

  // Navigate to portfolio page
  const handleViewPortfolio = () => {
    router.push("/portfolio")
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

  // Close wallet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showWalletMenu) {
        setShowWalletMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showWalletMenu])

  if (walletConnected) {
    return (
      <PageTransition>
        <main className="flex min-h-screen flex-col bg-gray-900">
          <motion.header
            className="border-b border-gray-800 p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="container mx-auto flex justify-between items-center">
              <motion.h1
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 tracking-tight"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="font-extrabold">Simpl</span>Yield
              </motion.h1>
              <div className="flex items-center gap-4">
                <motion.div
                  className="flex items-center px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-500/50 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm text-gray-300 font-medium">
                    {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}
                  </span>
                </motion.div>
                <div className="relative flex items-center">
                  <motion.div
                    className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      x: showWalletMenu ? -10 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      mass: 0.8,
                    }}
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                  >
                    <Wallet className="h-4 w-4 text-white" />
                  </motion.div>

                  <AnimatePresence>
                    {showWalletMenu && (
                      <motion.button
                        className="ml-3 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between border border-red-500/30 hover:border-red-500/50 z-50"
                        initial={{ opacity: 0, width: 0, x: -10 }}
                        animate={{ opacity: 1, width: "auto", x: 0 }}
                        exit={{ opacity: 0, width: 0, x: -10 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                          mass: 0.8,
                          opacity: { duration: 0.2 },
                        }}
                        onClick={() => {
                          setWalletConnected(false)
                          setShowWalletMenu(false)
                          setWalletAddress("")
                          setTransactions([])
                          // Show notification
                          setNotification({
                            type: "info",
                            title: "Wallet Disconnected",
                            message: "Your wallet has been disconnected. Please reconnect to continue.",
                          })
                          setShowNotification(true)
                        }}
                      >
                        <div className="flex items-center whitespace-nowrap">
                          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                          Disconnect
                        </div>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.header>

          <motion.div
            className="container mx-auto p-4 flex flex-col md:flex-row gap-4 flex-grow"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex-grow flex flex-col" variants={itemVariants}>
              <ChatInterface onMessageSubmit={handleMessageSubmit} />
            </motion.div>

            <motion.div className="w-full md:w-96 lg:w-[28rem] space-y-4" variants={containerVariants}>
              <motion.div className="relative group" variants={itemVariants}>
                {/* Background glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition duration-300"></div>

                {/* Button with glass effect */}
                <AnimatedGradientButton
                  gradientFrom="#1e293b"
                  gradientTo="#0f172a"
                  hoverGradientFrom="#1e293b"
                  hoverGradientTo="#0f172a"
                  className="relative w-full border border-purple-500/30 hover:border-purple-500/50 py-3 text-base font-medium flex items-center justify-center gap-3 rounded-xl overflow-hidden z-10 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20"
                  onClick={handleViewPortfolio}
                  glowColor="rgba(124, 58, 237, 0.5)"
                >
                  {/* Animated icon container */}
                  <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-inner shadow-white/10 group-hover:scale-110 transition-transform duration-300">
                    <BarChart2 className="h-4 w-4 text-white group-hover:animate-pulse" />

                    {/* Orbiting dot */}
                    <div className="absolute h-1.5 w-1.5 rounded-full bg-blue-400 animate-orbit opacity-70"></div>
                  </div>

                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-indigo-200 to-blue-200 group-hover:from-white group-hover:via-purple-100 group-hover:to-white transition-all duration-300">
                    View Portfolio
                  </span>

                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-purple-600/10 to-indigo-600/5 rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 h-8 w-8 bg-gradient-to-tr from-blue-600/10 to-purple-600/5 rounded-tr-full"></div>
                </AnimatedGradientButton>
              </motion.div>

              <AnimatedCard
                className="bg-gray-800/50 border border-gray-700 rounded-lg mt-6"
                hoverEffect="glow"
                delay={1}
              >
                <div className="p-4 border-b border-gray-700 flex items-center">
                  <h3 className="font-medium text-white">Recent Transactions</h3>
                </div>
                <TransactionHistory transactions={transactions} />
              </AnimatedCard>
            </motion.div>
          </motion.div>

          {/* Notification Toast */}
          <NotificationToast
            type={notification.type as "success" | "error" | "info" | "warning"}
            title={notification.title}
            message={notification.message}
            isVisible={showNotification}
            onClose={() => setShowNotification(false)}
            position="top-right"
          />
        </main>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-900 text-white">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(120,80,255,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(60,110,255,0.15),transparent_50%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <motion.div
              className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 15,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            ></motion.div>
            <motion.div
              className="absolute top-0 -right-20 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
              animate={{
                x: [0, -30, 0],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 18,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            ></motion.div>
            <motion.div
              className="absolute bottom-0 left-20 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
              animate={{
                x: [0, 20, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            ></motion.div>
          </div>

          <div className="container mx-auto px-4 py-12 relative z-10">
            <motion.div
              className="flex flex-col items-center text-center gap-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Main Content */}
              <motion.div className="max-w-3xl mx-auto" variants={itemVariants}>
                <motion.h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <motion.span
                    className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY }}
                    style={{ backgroundSize: "200% 200%" }}
                  >
                    <span className="font-extrabold">Simpl</span>Yield
                  </motion.span>
                </motion.h1>

                <motion.p
                  className="text-xl text-gray-300 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  SimplYield transforms complex DeFi operations into simple conversations.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row justify-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                >
                  <AnimatedGradientButton
                    gradientFrom="#9333ea"
                    gradientTo="#4f46e5"
                    hoverGradientFrom="#7e22ce"
                    hoverGradientTo="#4338ca"
                    className="px-4 py-2 rounded-lg text-base shadow-lg shadow-purple-900/20 transition-all hover:shadow-purple-900/30"
                    onClick={() => setWalletModalOpen(true)}
                  >
                    Connect Wallet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </AnimatedGradientButton>

                  <AnimatedGradientButton
                    gradientFrom="#1e293b"
                    gradientTo="#0f172a"
                    variant="outline"
                    className="border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-base"
                    onClick={() => setDemoModalOpen(true)}
                  >
                    See Demo
                  </AnimatedGradientButton>
                </motion.div>

                <motion.div
                  className="mt-6 flex justify-center items-center text-sm text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.8 }}
                >
                  <Shield className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Your assets remain in your control at all times</span>
                </motion.div>
              </motion.div>

              {/* Chat Preview */}
              <motion.div className="w-full max-w-md" variants={itemVariants} transition={{ delay: 0.8 }}>
                <div className="relative mx-auto">
                  {/* Glow effect */}
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-40"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                  ></motion.div>

                  {/* Chat interface preview */}
                  <motion.div
                    className="relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="p-3 border-b border-gray-700 flex items-center">
                      <motion.div
                        className="w-3 h-3 rounded-full bg-red-500 mr-2"
                        whileHover={{ scale: 1.2 }}
                      ></motion.div>
                      <motion.div
                        className="w-3 h-3 rounded-full bg-yellow-500 mr-2"
                        whileHover={{ scale: 1.2 }}
                      ></motion.div>
                      <motion.div
                        className="w-3 h-3 rounded-full bg-green-500 mr-2"
                        whileHover={{ scale: 1.2 }}
                      ></motion.div>
                      <div className="ml-2 text-sm text-gray-400">SimplYield Chat</div>
                    </div>

                    <div className="p-4 space-y-4">
                      <motion.div
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 text-sm">
                          <p>Hello! I'm your DeFi assistant. How can I help you today?</p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-start justify-end gap-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 }}
                      >
                        <div className="bg-purple-600 rounded-lg p-3 text-sm">
                          <p>Stake 5 SOL to earn yield</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                          <Wallet className="h-4 w-4 text-white" />
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.6 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 text-sm">
                          <p>Processing your request to stake 5 SOL. Transaction initiated...</p>
                        </div>
                      </motion.div>
                    </div>

                    <div className="p-3 border-t border-gray-700 bg-gray-800/70">
                      <div className="flex bg-gray-700 rounded-lg px-3 py-2 text-gray-400 text-sm">
                        <span>Type a message or command...</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating features */}
                  <motion.div
                    className="absolute -right-4 -top-4 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-lg"
                    initial={{ opacity: 0, y: -10, x: 10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ delay: 1.9 }}
                    whileHover={{ y: -5, x: 5, scale: 1.05 }}
                  >
                    <div className="flex items-center text-sm text-green-400">
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      <span>Simple Commands</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -left-4 -bottom-4 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-lg"
                    initial={{ opacity: 0, y: 10, x: -10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ delay: 2.1 }}
                    whileHover={{ y: 5, x: -5, scale: 1.05 }}
                  >
                    <div className="flex items-center text-sm text-purple-400">
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      <span>Real-time Execution</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wallet Connection Modal */}
        <AnimatePresence>
          {walletModalOpen && (
            <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
              <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Connect Your Wallet</DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                      Choose your preferred wallet to connect to SimplYield
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <Tabs defaultValue="phantom" className="w-full" onValueChange={setSelectedWallet}>
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger
                          value="phantom"
                          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-300"
                        >
                          Phantom
                        </TabsTrigger>
                        <TabsTrigger
                          value="solflare"
                          className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300"
                        >
                          Solflare
                        </TabsTrigger>
                        <TabsTrigger
                          value="other"
                          className="data-[state=active]:bg-gray-600 data-[state=active]:text-white transition-all duration-300"
                        >
                          Other
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="phantom" className="space-y-4">
                        <motion.div
                          className="flex justify-center py-6"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div
                            className="p-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Wallet className="h-14 w-14 text-white" />
                          </motion.div>
                        </motion.div>
                        <AnimatedGradientButton
                          gradientFrom="#9333ea"
                          gradientTo="#4f46e5"
                          hoverGradientFrom="#7e22ce"
                          hoverGradientTo="#4338ca"
                          className="w-full h-12"
                          onClick={handleConnectWallet}
                          disabled={connectingWallet}
                        >
                          {connectingWallet ? (
                            <div className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                              Connecting...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              Connect Phantom Wallet
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                          )}
                        </AnimatedGradientButton>
                      </TabsContent>

                      <TabsContent value="solflare" className="space-y-4">
                        <motion.div
                          className="flex justify-center py-6"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div
                            className="p-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Wallet className="h-14 w-14 text-white" />
                          </motion.div>
                        </motion.div>
                        <AnimatedGradientButton
                          gradientFrom="#f97316"
                          gradientTo="#dc2626"
                          hoverGradientFrom="#ea580c"
                          hoverGradientTo="#b91c1c"
                          className="w-full h-12"
                          onClick={handleConnectWallet}
                          disabled={connectingWallet}
                        >
                          {connectingWallet ? (
                            <div className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                              Connecting...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              Connect Solflare Wallet
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                          )}
                        </AnimatedGradientButton>
                      </TabsContent>

                      <TabsContent value="other" className="space-y-4">
                        <motion.div
                          className="flex justify-center py-6"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div
                            className="p-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Wallet className="h-14 w-14 text-white" />
                          </motion.div>
                        </motion.div>
                        <AnimatedGradientButton
                          gradientFrom="#4b5563"
                          gradientTo="#1f2937"
                          hoverGradientFrom="#374151"
                          hoverGradientTo="#111827"
                          className="w-full h-12"
                          onClick={handleConnectWallet}
                          disabled={connectingWallet}
                        >
                          {connectingWallet ? (
                            <div className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                              Connecting...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              Connect Other Wallet
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                          )}
                        </AnimatedGradientButton>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="flex justify-center">
                    <div className="flex items-start space-x-2 text-xs text-gray-400">
                      <Shield className="h-4 w-4 text-gray-500 mt-0.5" />
                      <p>Your connection is secure and you'll be able to disconnect your wallet at any time</p>
                    </div>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Demo Modal */}
        <AnimatePresence>
          {demoModalOpen && (
            <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
              <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <DialogHeader>
                    <DialogTitle>SimplYield Demo</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      See how SimplYield makes DeFi interactions simple through conversation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Example Commands:</h3>
                      <motion.div
                        className="bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700/70 transition-colors duration-300 cursor-pointer"
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="font-medium">Stake 4 SOL to Liquid Staking</p>
                        <p className="text-sm text-gray-400 mt-1">Stake your SOL tokens to earn yield</p>
                      </motion.div>
                      <motion.div
                        className="bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700/70 transition-colors duration-300 cursor-pointer"
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="font-medium">Swap 10 USDC to SOL</p>
                        <p className="text-sm text-gray-400 mt-1">Exchange tokens at market rates</p>
                      </motion.div>
                      <motion.div
                        className="bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700/70 transition-colors duration-300 cursor-pointer"
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="font-medium">Show my portfolio</p>
                        <p className="text-sm text-gray-400 mt-1">View your current holdings and performance</p>
                      </motion.div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="font-medium mb-4">Live Demo</h3>
                      <AnimatedGradientButton
                        gradientFrom="#9333ea"
                        gradientTo="#4f46e5"
                        hoverGradientFrom="#7e22ce"
                        hoverGradientTo="#4338ca"
                        className="w-full"
                        onClick={() => {
                          setDemoModalOpen(false)
                          setWalletConnected(true)
                        }}
                      >
                        Try SimplYield Now
                      </AnimatedGradientButton>
                    </div>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Notification Toast */}
        <NotificationToast
          type={notification.type as "success" | "error" | "info" | "warning"}
          title={notification.title}
          message={notification.message}
          isVisible={showNotification}
          onClose={() => setShowNotification(false)}
          position="bottom-right"
        />

        <style jsx global>{`
          @keyframes orbit {
            0% {
              transform: translateX(-10px) translateY(0) scale(0.8);
            }
            25% {
              transform: translateX(0) translateY(-10px) scale(1);
            }
            50% {
              transform: translateX(10px) translateY(0) scale(0.8);
            }
            75% {
              transform: translateX(0) translateY(10px) scale(1);
            }
            100% {
              transform: translateX(-10px) translateY(0) scale(0.8);
            }
          }
          
          .animate-orbit {
            animation: orbit 3s infinite linear;
          }
        `}</style>
      </main>
    </PageTransition>
  )
}
