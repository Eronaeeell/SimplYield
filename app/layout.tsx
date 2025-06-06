import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import { Wallet } from "lucide-react"
import { Walletsc } from "@/components/wallet-connect"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeFi AI Assistant",
  description: "AI-powered DeFi chatbot for crypto operations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Walletsc>
          {children}
          </Walletsc>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
