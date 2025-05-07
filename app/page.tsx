"use client"

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react"; // Solana wallet adapter hook
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ChatInterface } from "@/components/chat-interface";
import { TransactionHistory } from "@/components/transaction-history";
import { NotificationToast } from "@/components/ui/notification-toast";
import { PageTransition } from "@/components/ui/page-transition";

export default function Home() {
  const router = useRouter();
  const { connected, publicKey, disconnect, connect } = useWallet(); // Solana wallet hooks
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: "success", title: "", message: "" });

  // Effect to update wallet address
  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toString());
    } else {
      setWalletAddress("");
    }
  }, [connected, publicKey]);

  // Handle connection to wallet
  const handleConnectWallet = () => {
    connect().catch(() => {
      setNotification({
        type: "error",
        title: "Wallet Connection Failed",
        message: "Please try again later.",
      });
      setShowNotification(true);
    });
  };

  // Handle message submission for staking
  const handleMessageSubmit = (message: string) => {
    if (message.toLowerCase().includes("stake")) {
      const amount = message.match(/\d+/)?.[0] || "0";
      const coin = message.toLowerCase().includes("sol") ? "SOL" : "ETH";

      // Create transaction object
      const newTransaction = {
        id: Date.now().toString(),
        type: "stake",
        amount: amount,
        coin: coin,
        status: "processing",
        timestamp: new Date().toISOString(),
      };

      // Show processing notification
      setNotification({
        type: "info",
        title: "Transaction Processing",
        message: `Staking ${amount} ${coin}...`,
      });
      setShowNotification(true);

      // Simulate transaction completion after 2 seconds
      setTimeout(() => {
        newTransaction.status = "completed";
        setTransactions((prev) => [newTransaction, ...prev]);

        // Show success notification
        setNotification({
          type: "success",
          title: "Transaction Completed",
          message: `Successfully staked ${amount} ${coin}`,
        });
        setShowNotification(true);
      }, 2000);
    }
  };

  if (connected) {
    return (
      <PageTransition>
        <main className="flex min-h-screen flex-col bg-gray-900">
          <motion.header className="border-b border-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 tracking-tight">
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

          <motion.div className="container mx-auto p-4 flex flex-col md:flex-row gap-4 flex-grow">
            <motion.div className="flex-grow flex flex-col">
              <ChatInterface onMessageSubmit={handleMessageSubmit} />
            </motion.div>

            <motion.div className="w-full md:w-96 lg:w-[28rem] space-y-4">
              <motion.div className="relative group">
                {/* Background glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition duration-300"></div>

                {/* Button with glass effect */}
                <button
                  className="relative w-full py-3 text-base font-medium flex items-center justify-center gap-3 rounded-xl overflow-hidden z-10"
                  onClick={() => router.push("/portfolio")}
                >
                  <span>View Portfolio</span>
                </button>
              </motion.div>

              <motion.div className="bg-gray-800/50 border border-gray-700 rounded-lg mt-6">
                <div className="p-4 border-b border-gray-700 flex items-center">
                  <h3 className="font-medium text-white">Recent Transactions</h3>
                </div>
                <TransactionHistory transactions={transactions} />
              </motion.div>
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
    );
  }

  // If wallet is not connected, show the connect wallet option
  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-900 text-white">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center">
          <div className="container mx-auto px-4 py-12 relative z-10">
            <motion.div
              className="flex flex-col items-center text-center gap-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">SimplYield</h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                SimplYield transforms complex DeFi operations into simple conversations.
              </p>

              <motion.div className="flex justify-center gap-4">
                <WalletMultiButton className="px-4 py-2 rounded-lg text-base shadow-lg" onClick={handleConnectWallet}>
                  Connect Wallet
                </WalletMultiButton>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
