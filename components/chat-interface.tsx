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

const STAKE_REGEX = /^stake\s+(\d+(\.\d+)?)\s+(\w+)$/i
const SWAP_REGEX = /^swap\s+(\d+(\.\d+)?)\s+(\w+)\s+to\s+(\w+)$/i
const SEND_REGEX = /^send\s+(\d+(?:\.\d+)?)\s+sol\s+to\s+([a-zA-Z0-9]{32,44})$/i

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

type SuggestionBubble = {
  id: string
  text: string
  icon: React.ReactNode
}

export function ChatInterface() {
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hey! 👋 I'm here to help with anything Solana DeFi related. What can I do for you today? 📊 ⚡",
      sender: "bot",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const isStreamingRef = useRef(false)
  const { connection } = useConnection()

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

    const stakeMatch = input.match(STAKE_REGEX)
    const swapMatch = input.match(SWAP_REGEX)

    if (input.toLowerCase().startsWith("stake") && input.toLowerCase().includes("to bsol")) {
    if (!publicKey || !signTransaction || !connection) {
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

    const reply = await handleStakeToBSOLCommand(input, {
      publicKey,
      signTransaction: signTransaction as (tx: Transaction) => Promise<Transaction>,
      connection,
    });

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
  }

    if (input.toLowerCase().startsWith("stake") && input.toLowerCase().includes("to msol")) {
      const reply = await handleStakeToMSOLCommand(input, {
        publicKey,
        signTransaction,
        sendTransaction,
        connection
      })
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
    }
    
if (
  input.toLowerCase().startsWith("stake") && input.toLowerCase().includes("to bsol") ||
  input.trim().toLowerCase() === "unstake bsol" ||
  /^unstake\s+\d+(\.\d+)?\s+bsol$/i.test(input)
) {
  if (!publicKey || !signTransaction || !connection) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: "❌ Wallet not connected. Please connect your wallet to proceed.",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setIsTyping(false);
    return;
  }

  const reply = await handleStakeToBSOLCommand(input, {
    publicKey,
    signTransaction,
    connection,
  });

  if (reply) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: reply,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setIsTyping(false);
    return;
  }
}

if (
  input.toLowerCase().startsWith("unstake msol") ||
  /^unstake\s+\d+(\.\d+)?\s+msol$/i.test(input)
) {
  const reply = await handleUnstakeMSOLCommand(input, {
    publicKey,
    signTransaction,
    sendTransaction,
    connection
  })
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
}

    if (input.toLowerCase().startsWith("stake")) {
      const reply = await handleStakingCommand(input, {
        publicKey,
        signTransaction,
        sendTransaction,
      })
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
    }
    
    if (input.toLowerCase().startsWith("unstake")) {
      const reply = await handleUnstakingCommand(input, {
        publicKey,
        signTransaction,
        sendTransaction,
      })
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
    }

    if (input.toLowerCase().startsWith("send") && SEND_REGEX.test(input)) {
      const reply = await handleSendSolCommand(input, {
        publicKey,
        sendTransaction,
        connection
      })
      
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
    }
    
    try {
      // Create bot message placeholder with a unique ID
      const botMessageId = `bot-${Date.now()}`
      const botPlaceholder: Message = {
        id: botMessageId,
        content: "",
        sender: "bot",
        timestamp: new Date(),
      }
      
      // Add bot placeholder to existing messages
      setMessages((prev) => [...prev, botPlaceholder])

      // Use fetch for streaming instead of axios
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

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""
      let lastUpdateTime = 0
      isStreamingRef.current = true

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          fullContent += chunk

          // Throttle updates to every 50ms for smoother rendering
          const now = Date.now()
          if (now - lastUpdateTime >= 50 || done) {
            lastUpdateTime = now
            
            // Update message with accumulated content (line by line)
            setMessages((prev) => {
              const copy = [...prev]
              const msgIndex = copy.findIndex((m) => m.id === botMessageId)
              if (msgIndex !== -1) {
                copy[msgIndex] = {
                  ...copy[msgIndex],
                  content: fullContent,
                }
              }
              return copy
            })
          }
        }
        
        // Final update to ensure all content is shown
        setMessages((prev) => {
          const copy = [...prev]
          const msgIndex = copy.findIndex((m) => m.id === botMessageId)
          if (msgIndex !== -1) {
            copy[msgIndex] = {
              ...copy[msgIndex],
              content: fullContent,
            }
          }
          return copy
        })
        
        // Mark streaming as complete and scroll to bottom
        isStreamingRef.current = false
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }

      setIsTyping(false)
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
            {messages.filter(msg => msg.content.trim() !== "").map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
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
