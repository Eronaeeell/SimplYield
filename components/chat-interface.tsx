"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Sparkles,
  Zap,
  BarChart2,
  Coins,
  MessageSquare,
  Wallet,
} from "lucide-react"
import { handleStakingCommand, handleUnstakingCommand } from '@/stake-unstake/SOL/native-stake-SOL'
import { useWallet } from '@solana/wallet-adapter-react'
import { handleStakeToMSOLCommand, handleUnstakeMSOLCommand } from '@/stake-unstake/mSOL/liquid-stake-mSOL'
import { useConnection } from '@solana/wallet-adapter-react'
import { handleStakeToBSOLCommand } from '@/stake-unstake/bSOL/stake-to-bsol'
import { handleSendSolCommand } from "@/stake-unstake/SendSOL/send-sol"
import { Transaction } from "@solana/web3.js"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getNLUService, INTENTS } from "@/lib/nlu/nlu-service"
import { TransactionConfirmation, PendingTransaction } from "@/components/transaction-confirmation"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  transactionData?: PendingTransaction
}

type SuggestionBubble = {
  id: string
  text: string
  icon: React.ReactNode
}

export function ChatInterface() {
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const isStreamingRef = useRef(false)
  const { connection } = useConnection()
  const nluService = getNLUService()
  const [pendingIntent, setPendingIntent] = useState<{ intent: string; entities: any } | null>(null)
  const [pendingTransaction, setPendingTransaction] = useState<PendingTransaction & { nluResult: any } | null>(null)

  // Initialize NLU service on mount
  useEffect(() => {
    nluService.initialize().catch(console.error)
  }, [])

  const suggestions: SuggestionBubble[] = [
    { id: "s1", text: "Stake 1 SOL", icon: <Sparkles className="h-3 w-3" /> },
    {
      id: "s4",
      text: "What's my balance?",
      icon: <Coins className="h-3 w-3" />,
    },
  ]

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }

  useEffect(() => {
    // Only auto-scroll when not streaming
    if (!isStreamingRef.current) {
      scrollToBottom()
    }
  }, [messages.length])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }
    const updated = [...messages, userMessage]
    setMessages(updated)
    setInput("")
    setIsTyping(true)

    // ========== AI-POWERED NLU PROCESSING ==========
    try {
      // Skip NLU for casual conversation (greetings, short messages without commands)
      const casualPatterns = /^(hi|hey|hello|sup|yo|how are you|what's up|whats up|hows it going)$/i
      const isCasualInput = casualPatterns.test(input.trim()) || (input.length < 8 && !input.match(/\d/))
      
      if (isCasualInput && !pendingIntent) {
        console.log('💬 Casual input detected, skipping NLU')
        throw new Error('casual_input') // Jump to chatbot
      }

      // Process input with NLU
      let nluResult = await nluService.processInput(input)
      
      // Check if user is providing missing info from previous request
      if (pendingIntent && nluResult.entities.amount && !nluResult.valid) {
        // User might be answering with just the amount
        nluResult = {
          ...pendingIntent,
          entities: {
            ...pendingIntent.entities,
            ...nluResult.entities
          },
          valid: true,
          originalText: input
        } as any
        setPendingIntent(null)
      }
      
      console.log('🤖 NLU Result:', {
        intent: nluResult.intent,
        confidence: nluResult.confidence,
        entities: nluResult.entities,
        valid: nluResult.valid,
        pendingIntent: pendingIntent ? 'yes' : 'no'
      })

      // If confidence is too low (< 50%), skip NLU and let AI chatbot handle it
      if (nluResult.confidence < 0.5 && !pendingIntent) {
        console.log('⚠️ Low confidence, passing to AI chatbot')
        throw new Error('low_confidence') // Jump to chatbot
      }

      // Check if wallet is needed for this intent
      const walletRequiredIntents: string[] = [
        INTENTS.STAKE_NATIVE,
        INTENTS.STAKE_MSOL,
        INTENTS.STAKE_BSOL,
        INTENTS.UNSTAKE_NATIVE,
        INTENTS.UNSTAKE_MSOL,
        INTENTS.UNSTAKE_BSOL,
        INTENTS.SEND,
        INTENTS.BALANCE,
      ]

      if (walletRequiredIntents.includes(nluResult.intent) && !publicKey) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "❌ Wallet not connected. Please connect your wallet to proceed.",
            sender: "bot",
            timestamp: new Date(),
          },
        ])
        setIsTyping(false)
        return
      }

      // Validate entities
      if (!nluResult.valid) {
        // Store the pending intent so user can provide missing info in next message
        setPendingIntent({
          intent: nluResult.intent,
          entities: nluResult.entities
        })
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: nluResult.errorMessage || "I need more information to complete this request.",
            sender: "bot",
            timestamp: new Date(),
          },
        ])
        setIsTyping(false)
        return
      }
      
      // Clear pending intent when we have a valid command
      setPendingIntent(null)

      // Route to appropriate handler based on intent
      let reply: string | null = null

      switch (nluResult.intent) {
        case INTENTS.STAKE_NATIVE:
          // Add transaction confirmation as a message
          const stakeTransaction: PendingTransaction = {
            id: Date.now().toString(),
            type: 'stake',
            token: 'sol',
            amount: nluResult.entities.amount,
            estimatedFee: 0.00001,
            nluResult
          }
          setPendingTransaction(stakeTransaction)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: '',
              sender: 'bot',
              timestamp: new Date(),
              transactionData: stakeTransaction
            }
          ])
          setIsTyping(false)
          return

        case INTENTS.STAKE_MSOL:
          const stakeMsolTransaction: PendingTransaction = {
            id: Date.now().toString(),
            type: 'stake',
            token: 'msol',
            amount: nluResult.entities.amount,
            estimatedFee: 0.00001,
            nluResult
          }
          setPendingTransaction(stakeMsolTransaction)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: '',
              sender: 'bot',
              timestamp: new Date(),
              transactionData: stakeMsolTransaction
            }
          ])
          setIsTyping(false)
          return

        case INTENTS.STAKE_BSOL:
          if (!signTransaction || !publicKey) {
            reply = "❌ Transaction signing not available"
            break
          }
          const stakeBsolTransaction: PendingTransaction = {
            id: Date.now().toString(),
            type: 'stake',
            token: 'bsol',
            amount: nluResult.entities.amount,
            estimatedFee: 0.00001,
            nluResult
          }
          setPendingTransaction(stakeBsolTransaction)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: '',
              sender: 'bot',
              timestamp: new Date(),
              transactionData: stakeBsolTransaction
            }
          ])
          setIsTyping(false)
          return

        case INTENTS.UNSTAKE_NATIVE:
          if (publicKey) {
            const unstakeTransaction: PendingTransaction = {
              id: Date.now().toString(),
              type: 'unstake',
              token: 'sol',
              amount: nluResult.entities.amount,
              estimatedFee: 0.00001,
              nluResult
            }
            setPendingTransaction(unstakeTransaction)
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                content: '',
                sender: 'bot',
                timestamp: new Date(),
                transactionData: unstakeTransaction
              }
            ])
            setIsTyping(false)
            return
          }
          break

        case INTENTS.UNSTAKE_MSOL:
          if (publicKey) {
            const unstakeMsolTransaction: PendingTransaction = {
              id: Date.now().toString(),
              type: 'unstake',
              token: 'msol',
              amount: nluResult.entities.amount,
              estimatedFee: 0.00001,
              nluResult
            }
            setPendingTransaction(unstakeMsolTransaction)
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                content: '',
                sender: 'bot',
                timestamp: new Date(),
                transactionData: unstakeMsolTransaction
              }
            ])
            setIsTyping(false)
            return
          }
          break

        case INTENTS.UNSTAKE_BSOL:
          if (!signTransaction || !publicKey) {
            reply = "❌ Transaction signing not available"
            break
          }
          const unstakeBsolTransaction: PendingTransaction = {
            id: Date.now().toString(),
            type: 'unstake',
            token: 'bsol',
            amount: nluResult.entities.amount,
            estimatedFee: 0.00001,
            nluResult
          }
          setPendingTransaction(unstakeBsolTransaction)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: '',
              sender: 'bot',
              timestamp: new Date(),
              transactionData: unstakeBsolTransaction
            }
          ])
          setIsTyping(false)
          return

        case INTENTS.SEND:
          const sendTransaction: PendingTransaction = {
            id: Date.now().toString(),
            type: 'send',
            token: 'sol',
            amount: nluResult.entities.amount,
            recipient: nluResult.entities.address,
            estimatedFee: 0.00005,
            nluResult
          }
          setPendingTransaction(sendTransaction)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: '',
              sender: 'bot',
              timestamp: new Date(),
              transactionData: sendTransaction
            }
          ])
          setIsTyping(false)
          return

        case INTENTS.BALANCE:
          if (publicKey) {
            const lamports = await connection.getBalance(publicKey)
            const sol = lamports / LAMPORTS_PER_SOL
            reply = `Your current balance is **${sol.toFixed(4)} SOL**`
          }
          break

        default:
          // For EXPLAIN, PRICE, MARKET_DATA, fall through to chatbot
          reply = null
          break
      }

      // If a command handler returned a reply, show it
      if (reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: reply,
            sender: "bot",
            timestamp: new Date(),
          },
        ])
        setIsTyping(false)
        return
      }
    } catch (nluError: any) {
      // Don't log casual inputs or low confidence as errors
      if (nluError.message !== 'casual_input' && nluError.message !== 'low_confidence') {
        console.error('NLU processing error:', nluError)
      }
      // Fall through to chatbot on NLU error, casual input, or low confidence
    }
    
    try {
      // Fetch response from API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
          messages: updated.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Parse JSON response
      const data = await response.json()
      
      if (!data.reply) {
        throw new Error("Empty response from server")
      }

      // Add bot message with the reply
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.reply,
          sender: "bot",
          timestamp: new Date(),
        },
      ])

      setIsTyping(false)
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    } catch (err: any) {
      console.error("Chat error:", err)
      
      let errorMessage = "An error occurred while processing your request."
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please try again."
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please check API configuration."
      } else if (err.response?.status === 429) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again."
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later."
      } else if (err.response?.data?.error) {
        errorMessage = typeof err.response.data.error === 'string' 
          ? err.response.data.error 
          : err.response.data.error.message || "API error occurred"
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `❌ ${errorMessage}`,
          sender: "bot",
          timestamp: new Date(),
        },
      ])
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage()
  }

  const getWalletBalanceText = async () => {
  if (!publicKey) {
    return "❌ Wallet not connected. Please connect your wallet to proceed."
  }
  const lamports = await connection.getBalance(publicKey)
  const sol = lamports / LAMPORTS_PER_SOL
  return `Your current balance is **${sol.toFixed(4)} SOL**`
}

const handleSuggestionClick = async (text: string) => {
  if (text === "What's my balance?") {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)
    const response = await getWalletBalanceText()
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: response,
        sender: "bot",
        timestamp: new Date(),
      },
    ])
    setIsTyping(false)
    return
  }

  if (text === "Stake 1 SOL") {
    setInput(text)
    inputRef.current?.focus()
    return
  }

  setInput(text)
  inputRef.current?.focus()
}

  // Handle transaction approval
  const handleApproveTransaction = async () => {
    if (!pendingTransaction) return
    
    const { nluResult } = pendingTransaction
    setIsTyping(true)
    
    try {
      let reply: string | null = null
      
      // Execute the actual transaction based on stored intent
      switch (nluResult.intent) {
        case INTENTS.STAKE_NATIVE:
          reply = await handleStakingCommand(
            `stake ${nluResult.entities.amount} sol`,
            { publicKey, signTransaction, sendTransaction }
          )
          break
          
        case INTENTS.STAKE_MSOL:
          reply = await handleStakeToMSOLCommand(
            `stake ${nluResult.entities.amount} to msol`,
            { publicKey, signTransaction, sendTransaction, connection }
          )
          break
          
        case INTENTS.STAKE_BSOL:
          if (!signTransaction || !publicKey) {
            reply = "❌ Transaction signing not available"
            break
          }
          reply = await handleStakeToBSOLCommand(
            `stake ${nluResult.entities.amount} to bsol`,
            {
              publicKey,
              signTransaction: signTransaction as (tx: Transaction) => Promise<Transaction>,
              connection,
            }
          )
          break
          
        case INTENTS.UNSTAKE_NATIVE:
          if (publicKey) {
            reply = await handleUnstakingCommand(
              `unstake ${nluResult.entities.amount} sol`,
              { publicKey, signTransaction, sendTransaction }
            )
          }
          break
          
        case INTENTS.UNSTAKE_MSOL:
          if (publicKey) {
            reply = await handleUnstakeMSOLCommand(
              `unstake ${nluResult.entities.amount} msol`,
              { publicKey, signTransaction, sendTransaction, connection }
            )
          }
          break
          
        case INTENTS.UNSTAKE_BSOL:
          if (!signTransaction || !publicKey) {
            reply = "❌ Transaction signing not available"
            break
          }
          reply = await handleStakeToBSOLCommand(
            `unstake ${nluResult.entities.amount} bsol`,
            {
              publicKey,
              signTransaction: signTransaction as (tx: Transaction) => Promise<Transaction>,
              connection,
            }
          )
          break
          
        case INTENTS.SEND:
          reply = await handleSendSolCommand(
            `send ${nluResult.entities.amount} sol to ${nluResult.entities.address}`,
            { publicKey, sendTransaction, connection }
          )
          break
      }
      
      // Extract transaction signature from reply (format: "...https://solscan.io/tx/{txid}...")
      let txSignature: string | undefined
      if (reply) {
        const txMatch = reply.match(/tx\/([A-Za-z0-9]+)/)
        if (txMatch) {
          txSignature = txMatch[1]
        }
      }
      
      // Update transaction status to success (keep card visible in messages)
      setMessages((prev) => 
        prev.map(msg => 
          msg.transactionData?.id === pendingTransaction.id
            ? { 
                ...msg, 
                transactionData: { 
                  ...pendingTransaction, 
                  status: 'success' as const,
                  transactionSignature: txSignature
                } 
              }
            : msg
        )
      )
    } catch (error: any) {
      console.error('Transaction execution error:', error)
      
      // Update transaction status to failed (keep card visible in messages)
      setMessages((prev) => 
        prev.map(msg => 
          msg.transactionData?.id === pendingTransaction.id
            ? { ...msg, transactionData: { ...pendingTransaction, status: 'failed' as const } }
            : msg
        )
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleViewDetails = () => {
    // Find the transaction in messages to get updated status
    const txMessage = messages.find(msg => msg.transactionData?.id === pendingTransaction?.id)
    const txData = txMessage?.transactionData
    
    if (txData?.status === 'failed') {
      // Show failure message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "❌ Transaction failed",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    } else if (txData?.transactionSignature) {
      // Open transaction on Solana Explorer
      window.open(`https://solscan.io/tx/${txData.transactionSignature}?cluster=devnet`, '_blank')
    } else {
      // No signature available
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "⚠️ No transaction signature available",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    }
  }

  const handleDeclineTransaction = () => {
    setPendingTransaction(null)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: "❌ Transaction cancelled.",
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  }

  const handleEditTransaction = (newAmount: number) => {
    if (!pendingTransaction) return
    
    // Update the transaction amount in messages
    setMessages((prev) => 
      prev.map(msg => 
        msg.transactionData?.id === pendingTransaction.id
          ? { 
              ...msg, 
              transactionData: { 
                ...msg.transactionData, 
                amount: newAmount,
                nluResult: {
                  ...msg.transactionData.nluResult,
                  entities: {
                    ...msg.transactionData.nluResult?.entities,
                    amount: newAmount
                  }
                }
              } 
            }
          : msg
      )
    )
    
    // Update pending transaction state
    setPendingTransaction({
      ...pendingTransaction,
      amount: newAmount,
      nluResult: {
        ...pendingTransaction.nluResult,
        entities: {
          ...pendingTransaction.nluResult?.entities,
          amount: newAmount
        }
      }
    })
  }



  const messageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3
      } 
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  return (
    <Card className="flex flex-col h-full max-h-[700px] w-full bg-transparent border-transparent rounded-xl overflow-hidden shadow-none relative">
      {/* Messages */}
      <ScrollArea className="flex-grow p-4 relative z-10 h-[280px] md:h-[470px] scroll-smooth">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.filter(msg => msg.content.trim() !== "" || msg.transactionData).map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {msg.transactionData ? (
                  // Render transaction confirmation card
                  <div className="w-full max-w-md">
                    <TransactionConfirmation
                      transaction={msg.transactionData}
                      onApprove={handleApproveTransaction}
                      onDecline={handleDeclineTransaction}
                      onEdit={handleEditTransaction}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ) : (
                  // Render regular message
                <div
                  className={`flex items-start gap-3 max-w-[85%] ${
                    msg.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar circle… */}
                  <div
                    className={`rounded-2xl p-3 flex-1 min-w-0 overflow-hidden text-sm ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-none shadow-lg shadow-purple-900/10"
                        : "bg-gradient-to-br from-gray-700/90 to-gray-800/90 text-white border border-gray-700/50 rounded-tl-none shadow-lg shadow-gray-900/10"
                    }`}
                  >
                    {/* Markdown rendering with custom styling */}
                    <div className={`break-words text-sm ${msg.sender === "bot" ? "chat-markdown" : ""}`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5 text-purple-300 border-b border-purple-500/30 pb-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 mt-4 text-blue-300" {...props} />,
                          p: ({node, ...props}) => <p className="mb-3 text-gray-100 leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-white bg-purple-500/20 px-1 rounded" {...props} />,
                          code: ({node, inline, className, children, ...props}: any) => 
                            inline ? (
                              <code className="bg-gray-900/60 text-purple-300 px-2 py-0.5 rounded font-mono text-sm border border-purple-500/30" {...props}>{children}</code>
                            ) : (
                              <code className="block bg-gray-900/80 p-4 rounded-lg mb-4 overflow-x-auto border border-gray-700 text-green-300" {...props}>{children}</code>
                            ),
                          ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-4 space-y-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-2" {...props} />,
                          li: ({node, ...props}) => <li className="text-gray-100 leading-relaxed pl-1" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-yellow-500 bg-yellow-500/10 pl-4 py-2 mb-4 italic text-yellow-100" {...props} />,
                          hr: ({node, ...props}) => <hr className="border-gray-600 my-6" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <div
                      className={`text-xs mt-2 flex justify-end ${
                        msg.sender === "user" ? "text-purple-200/70" : "text-gray-400/70"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator (same) */}
          {isTyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="h-9 w-9 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-blue-900/20">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl p-4 bg-gradient-to-br from-gray-700/90 to-gray-800/90 text-white border border-gray-700/50 rounded-tl-none shadow-lg shadow-gray-900/10">
                  <div className="flex space-x-1">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gray-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggestions */}
      <motion.div className="px-4 pt-2 pb-1 border-transparent bg-transparent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <p className="text-xs text-gray-400 whitespace-nowrap">Try asking:</p>
          {suggestions.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => handleSuggestionClick(s.text)}
              className="flex items-center gap-1.5 px-2 py-1 bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-full text-xs whitespace-nowrap transition-colors border border-gray-600/30 hover:border-purple-500/50"
              whileHover={{ scale: 1.05, x: 3 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              {s.icon}
              {s.text}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Input */}
      <motion.div className="px-4 pt-1 pb-4 border-transparent bg-transparent relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <div className="flex space-x-2">
          <div className="relative flex-grow">
            <motion.div className={`rounded-xl overflow-hidden ${isInputFocused ? "ring-2 ring-purple-500" : ""}`} transition={{ duration: 0.3 }}>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Type a message or command..."
                className="bg-transparent border-gray-600/30 text-white focus:ring-purple-500 focus:border-purple-500 pl-4 pr-10 py-6 rounded-xl transition-all duration-300"
              />
            </motion.div>
            <motion.button
              onClick={handleSendMessage}
              disabled={!input.trim()}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full h-7 w-7 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Card>
  )
  }
