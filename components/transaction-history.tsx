"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"

export function TransactionHistory({
  transactions = [],
}: {
  transactions: any[]
}) {
  // If no transactions provided, use demo data
  const txData =
    transactions.length > 0
      ? transactions
      : [
          {
            id: "tx1",
            type: "stake",
            amount: "5",
            coin: "SOL",
            status: "completed",
            timestamp: "2023-04-15T10:30:00Z",
          },
          {
            id: "tx2",
            type: "unstake",
            amount: "2.5",
            coin: "SOL",
            status: "completed",
            timestamp: "2023-04-14T14:22:00Z",
          },
          {
            id: "tx3",
            type: "swap",
            amount: "10",
            coin: "USDC",
            toCoin: "SOL",
            toAmount: "0.1",
            status: "completed",
            timestamp: "2023-04-13T09:15:00Z",
          },
        ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "stake":
        return <ArrowUpRight className="h-4 w-4 text-green-400" />
      case "unstake":
        return <ArrowDownLeft className="h-4 w-4 text-red-400" />
      case "swap":
        return (
          <div className="relative">
            <ArrowUpRight className="h-4 w-4 text-blue-400" />
            <ArrowDownLeft className="h-4 w-4 text-blue-400 absolute -top-1 -left-1" />
          </div>
        )
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400"
      case "failed":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getTransactionLabel = (tx: any) => {
    switch (tx.type) {
      case "stake":
        return `Staked ${tx.amount} ${tx.coin}`
      case "unstake":
        return `Unstaked ${tx.amount} ${tx.coin}`
      case "swap":
        return `Swapped ${tx.amount} ${tx.coin} to ${tx.toAmount} ${tx.toCoin}`
      default:
        return `${tx.type} ${tx.amount} ${tx.coin}`
    }
  }

  return (
    <ScrollArea className="h-[320px]">
      <div className="px-4 py-2">
        {txData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions yet</div>
        ) : (
          <div className="space-y-4">
            {txData.map((tx) => (
              <div key={tx.id} className="flex items-start space-x-3 py-2 border-b border-gray-700 last:border-0">
                <div className="p-2 rounded-full bg-gray-700/50 mt-1">{getTransactionIcon(tx.type)}</div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm text-white truncate">{getTransactionLabel(tx)}</h4>
                    <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">{formatDate(tx.timestamp)}</p>
                    <p className="text-xs font-medium">ID: {tx.id.substring(0, 6)}...</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
