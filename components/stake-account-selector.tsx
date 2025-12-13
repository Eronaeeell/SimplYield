"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { PublicKey } from "@solana/web3.js"

export type StakeAccount = {
  stakePubkey: string | PublicKey
  lamports: number
  status: string
}

type StakeAccountSelectorProps = {
  accounts: StakeAccount[]
  onSelect: (index: number) => void
  onCancel: () => void
  action: 'unstake' | 'withdraw'
}

export function StakeAccountSelector({ 
  accounts, 
  onSelect, 
  onCancel,
  action 
}: StakeAccountSelectorProps) {
  const LAMPORTS_PER_SOL = 1_000_000_000

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-slate-700/50 bg-slate-800/60 backdrop-blur-xl shadow-lg overflow-hidden max-w-sm">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <p className="text-sm text-slate-300 font-medium">
            Select Stake Account to {action === 'unstake' ? 'Unstake' : 'Withdraw'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {accounts.length} active account{accounts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Accounts List - hidden scrollbar */}
        <div className="p-4 space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
          {accounts.map((account, index) => {
            const amount = (account.lamports / LAMPORTS_PER_SOL).toFixed(4)
            const address = typeof account.stakePubkey === 'string' 
              ? account.stakePubkey 
              : account.stakePubkey.toBase58()
            const shortAddress = `${address.slice(0, 6)}...${address.slice(-6)}`

            return (
              <button
                key={address}
                onClick={() => onSelect(index)}
                className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-blue-500/50 rounded-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-mono text-slate-300">{shortAddress}</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {amount} SOL
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            )
          })}
        </div>

        {/* Cancel Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={onCancel}
            className="w-full text-sm text-slate-400 hover:text-slate-300 transition-colors py-2"
          >
            Cancel
          </button>
        </div>
      </Card>
    </motion.div>
  )
}
