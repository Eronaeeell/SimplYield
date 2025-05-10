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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const suggestions: SuggestionBubble[] = [
    { id: "s1", text: "Stake 5 SOL", icon: <Sparkles className="h-3 w-3" /> },
    {
      id: "s2",
      text: "Show my portfolio",
      icon: <BarChart2 className="h-3 w-3" />,
    },
    { id: "s3", text: "Swap 10 USDC to SOL", icon: <Zap className="h-3 w-3" /> },
    {
      id: "s4",
      text: "What's my balance?",
      icon: <Coins className="h-3 w-3" />,
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // 1) Add the user message
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

    // 2) Call your /api/chat endpoint
    try {
      const res = await axios.post("/api/chat", {
        prompt: input,
        messages: updated.map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content,
        })),
      })
      const { reply } = res.data

      // 3) Insert a placeholder bot message we’ll stream into
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "",
          sender: "bot",
          timestamp: new Date(),
        },
      ])

      // 4) Stream it out one char at a time
      let idx = 0
      const interval = setInterval(() => {
        idx++
        const partial = reply.slice(0, idx)
        setMessages((prev) => {
          const copy = [...prev]
          const last = copy.length - 1
          if (copy[last]?.sender === "bot") {
            copy[last] = {
              ...copy[last],
              content: partial,
            }
          }
          return copy
        })
        if (idx >= reply.length) {
          clearInterval(interval)
          setIsTyping(false)
        }
      }, 20)
    } catch (err) {
      console.error("Chat error:", err)
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage()
  }

  const handleSuggestionClick = (text: string) => {
    setInput(text)
    inputRef.current?.focus()
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 100, transition: { duration: 0.2 } },
  }

  return (
    <Card className="flex flex-col h-full bg-gradient-to-b from-gray-800/80 to-gray-900/90 border-gray-700 rounded-xl overflow-hidden shadow-xl relative">
      {/* Background animations omitted for brevity… */}

      {/* Header */}
      {/* …same as before… */}

      {/* Messages */}
      <ScrollArea className="flex-grow p-4 relative z-10 h-[400px] md:h-[500px]">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div
                  className={`flex items-start gap-3 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                >
                  {/* Avatar circle… */}
                  <motion.div
                    className={`rounded-2xl p-4 ${msg.sender === "user"
                        ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-none shadow-lg shadow-purple-900/10"
                        : "bg-gradient-to-br from-gray-700/90 to-gray-800/90 text-white border border-gray-700/50 rounded-tl-none shadow-lg shadow-gray-900/10"
                      }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* ← Here’s the Markdown rendering */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    <div
                      className={`text-xs mt-2 flex justify-end ${msg.sender === "user" ? "text-purple-200/70" : "text-gray-400/70"
                        }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator (same) */}
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
      <motion.div className="px-4 py-3 border-t border-gray-700/30 bg-gray-800/40 backdrop-blur-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <p className="text-xs text-gray-400 whitespace-nowrap">Try asking:</p>
          {suggestions.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => handleSuggestionClick(s.text)}
              className="flex items-center gap-1.5 px-2 py-1 bg-gray-700/70 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full text-xs whitespace-nowrap transition-colors border border-gray-600/50 hover:border-purple-500/50"
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
      <motion.div className="p-4 border-t border-gray-700/50 bg-gray-800/70 backdrop-blur-sm relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
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
