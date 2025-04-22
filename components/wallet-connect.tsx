"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Shield, ArrowRight } from "lucide-react"

export function WalletConnect({ onConnect }: { onConnect: () => void }) {
  const [connecting, setConnecting] = useState(false)

  const handleConnect = () => {
    setConnecting(true)
    // Simulate wallet connection
    setTimeout(() => {
      setConnecting(false)
      onConnect()
    }, 1500)
  }

  return (
    <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 text-white">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-4">
          <Wallet className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
          Welcome to SimplYield
        </CardTitle>
        <CardDescription className="text-gray-400">
          Connect your wallet to access simplified DeFi operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="phantom" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="phantom">Phantom</TabsTrigger>
            <TabsTrigger value="solflare">Solflare</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          <TabsContent value="phantom" className="space-y-4">
            <div className="flex justify-center py-8">
              <div className="p-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg">
                <Wallet className="h-16 w-16 text-white" />
              </div>
            </div>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12"
            >
              {connecting ? (
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
            </Button>
          </TabsContent>

          <TabsContent value="solflare" className="space-y-4">
            <div className="flex justify-center py-8">
              <div className="p-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                <Wallet className="h-16 w-16 text-white" />
              </div>
            </div>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 h-12"
            >
              {connecting ? (
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
            </Button>
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <div className="flex justify-center py-8">
              <div className="p-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg">
                <Wallet className="h-16 w-16 text-white" />
              </div>
            </div>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 h-12"
            >
              {connecting ? (
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
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="flex items-start space-x-2 text-xs text-gray-400">
          <Shield className="h-4 w-4 text-gray-500 mt-0.5" />
          <p>Your connection is secure and you'll be able to disconnect your wallet at any time</p>
        </div>
      </CardFooter>
    </Card>
  )
}
