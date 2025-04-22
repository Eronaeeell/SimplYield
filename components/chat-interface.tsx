"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles, Zap, BarChart2, Coins, MessageSquare, Wallet } from "lucide-react"

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

export function ChatInterface({
  onMessageSubmit,
}: {
  onMessageSubmit: (message: string) => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your SimplYield assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
    {
      id: "2",
      content: "Try commands like 'Stake 4 SOL' or 'Show my portfolio'",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Suggested commands
  const suggestions: SuggestionBubble[] = [
    { id: "s1", text: "Stake 5 SOL", icon: <Sparkles className="h-3 w-3" /> },
    { id: "s2", text: "Show my portfolio", icon: <BarChart2 className="h-3 w-3" /> },
    { id: "s3", text: "Swap 10 USDC to SOL", icon: <Zap className="h-3 w-3" /> },
    { id: "s4", text: "What's my balance?", icon: <Coins className="h-3 w-3" /> },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    onMessageSubmit(input)
    setInput("")

    // Show typing indicator
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false)
      let botResponse = "I've processed your request."

      // Customize bot response based on user message
      if (input.toLowerCase().includes("stake")) {
        const amount = input.match(/\d+/)?.[0] || ""
        const coin = input.toLowerCase().includes("sol") ? "SOL" : "tokens"
        botResponse = `Processing your request to stake ${amount} ${coin}. Transaction initiated...`
      } else if (input.toLowerCase().includes("portfolio")) {
        botResponse =
          "I've analyzed your portfolio. You currently have assets across multiple pools with a total value of 245.32 SOL."
      } else if (input.toLowerCase().includes("help")) {
        botResponse =
          "I can help you stake tokens, check your portfolio, or execute other DeFi operations. Just tell me what you'd like to do."
      } else if (input.toLowerCase().includes("swap")) {
        botResponse = "I'm preparing a swap transaction for you. Let me find the best rates..."
      } else if (input.toLowerCase().includes("balance")) {
        botResponse = "Your current balance is 245.32 SOL ($24,532.00)."
      }

      const botMessage: Message = {
        id: Date.now().toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    // Focus the input after selecting a suggestion
    inputRef.current?.focus()
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 100, transition: { duration: 0.2 } },
  }

  return (
    <Card className="flex flex-col h-full bg-gradient-to-b from-gray-800/80 to-gray-900/90 border-gray-700 rounded-xl overflow-hidden shadow-xl relative">
      {/* Cosmic background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(120,80,255,0.15),transparent_50%)]"
          animate={{
            opacity: [0.5, 0.7, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(60,110,255,0.15),transparent_50%)]"
          animate={{
            opacity: [0.5, 0.7, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
        ></motion.div>
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY }}
        ></motion.div>
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, delay: 3 }}
        ></motion.div>
      </div>

      {/* Header */}
      <motion.div
        className="p-4 border-b border-gray-700/50 bg-gray-800/70 backdrop-blur-sm relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-900/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-lg font-semibold text-white">SimplYield Assistant</h2>
            </div>
          </div>
          <motion.div className="flex items-center space-x-1" whileHover={{ scale: 1.05 }}>
            <div className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-medium text-purple-300 flex items-center">
              <Sparkles className="h-3 w-3 mr-1.5" />
              <span>AI Powered</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Messages area */}
      <ScrollArea className="flex-grow p-4 relative z-10 h-[400px] md:h-[500px]">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div
                  className={`flex items-start gap-3 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <motion.div
                    className={`h-9 w-9 rounded-full flex items-center justify-center shadow-lg ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-900/20"
                        : "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-blue-900/20"
                    }`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {message.sender === "user" ? (
                      <Wallet className="h-4 w-4 text-white" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-white" />
                    )}
                  </motion.div>
                  <motion.div
                    className={`rounded-2xl p-4 ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-none shadow-lg shadow-purple-900/10"
                        : "bg-gradient-to-br from-gray-700/90 to-gray-800/90 text-white border border-gray-700/50 rounded-tl-none shadow-lg shadow-gray-900/10"
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                    <div
                      className={`text-xs mt-2 flex justify-end ${
                        message.sender === "user" ? "text-purple-200/70" : "text-gray-400/70"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-blue-900/20">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-2xl p-4 bg-gradient-to-br from-gray-700/90 to-gray-800/90 text-white border border-gray-700/50 rounded-tl-none shadow-lg shadow-gray-900/10">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-gray-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                      ></motion.div>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-gray-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.15 }}
                      ></motion.div>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-gray-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggestion bubbles */}
      <motion.div
        className="px-4 py-3 border-t border-gray-700/30 bg-gray-800/40 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <p className="text-xs text-gray-400 whitespace-nowrap">Try asking:</p>
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="flex items-center gap-1.5 px-2 py-1 bg-gray-700/70 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full text-xs whitespace-nowrap transition-colors border border-gray-600/50 hover:border-purple-500/50"
              whileHover={{ scale: 1.05, x: 3 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              {suggestion.icon}
              {suggestion.text}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Input area */}
      <motion.div
        className="p-4 border-t border-gray-700/50 bg-gray-800/70 backdrop-blur-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex space-x-2">
          <div className="relative flex-grow">
            <motion.div
              animate={{
                boxShadow: isInputFocused ? "0 0 0 2px rgba(124, 58, 237, 0.5)" : "0 0 0 0 rgba(124, 58, 237, 0)",
              }}
              transition={{ duration: 0.3 }}
              className="rounded-xl overflow-hidden"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Type a message or command..."
                className="bg-gray-700/70 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 pl-4 pr-10 py-6 rounded-xl transition-all duration-300"
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
