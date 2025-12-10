"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Check, X } from "lucide-react"
import { useState } from "react"

export type PendingTransaction = {
  id: string
  type: 'stake' | 'unstake' | 'send'
  token: string
  amount: number
  recipient?: string
  estimatedFee?: number
  status?: 'pending' | 'success' | 'failed'
  transactionSignature?: string
  remainingBalance?: number
}

type TransactionConfirmationProps = {
  transaction: PendingTransaction
  onApprove: () => void
  onDecline: () => void
  onEdit?: (newAmount: number) => void
  onViewDetails?: (txData?: PendingTransaction) => void
}

export function TransactionConfirmation({ 
  transaction, 
  onApprove, 
  onDecline,
  onEdit,
  onViewDetails
}: TransactionConfirmationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedAmount, setEditedAmount] = useState(transaction.amount.toString())

  const getActionText = () => {
    switch (transaction.type) {
      case 'stake':
        return 'Stake'
      case 'unstake':
        return 'Unstake'
      case 'send':
        return 'Send'
      default:
        return 'Transaction'
    }
  }

  const handleSaveEdit = () => {
    const newAmount = parseFloat(editedAmount)
    if (!isNaN(newAmount) && newAmount > 0 && onEdit) {
      onEdit(newAmount)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedAmount(transaction.amount.toString())
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-slate-700/50 bg-slate-800/60 backdrop-blur-xl shadow-lg overflow-hidden max-w-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <p className="text-sm text-slate-300 font-medium">Transaction Confirmation</p>
        </div>

        {/* Transaction Details */}
        <div className="p-4 space-y-3">
          {/* Amount */}
          <div className="text-center py-2">
            {isEditing ? (
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  step="0.001"
                  value={editedAmount}
                  onChange={(e) => setEditedAmount(e.target.value)}
                  className="w-32 text-center text-2xl font-bold bg-slate-700/50 border-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  autoFocus
                />
                <span className="text-xl font-bold text-slate-300">{transaction.token.toUpperCase()}</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-white mb-1">
                {transaction.amount} {transaction.token.toUpperCase()}
              </p>
            )}
            <p className="text-sm text-slate-400 mt-1">
              {getActionText()}
            </p>
          </div>

          {/* Recipient (for send transactions) */}
          {transaction.recipient && (
            <div className="text-center py-1">
              <p className="text-xs text-slate-500 mb-1">To</p>
              <p className="text-sm text-slate-300 font-mono break-all px-2">
                {transaction.recipient}
              </p>
            </div>
          )}
          
          {/* Remaining Balance (for success status) */}
          {transaction.status === 'success' && transaction.remainingBalance !== undefined && (
            <div className="text-center py-2 border-t border-slate-700/50 mt-2">
              <p className="text-xs text-slate-500 mb-1">Remaining Balance</p>
              <p className="text-lg font-semibold text-green-400">
                {transaction.remainingBalance.toFixed(4)} {transaction.token.toUpperCase()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {transaction.status === 'success' ? (
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => onViewDetails?.(transaction)}
                variant="outline"
                className="border border-blue-600 bg-transparent hover:bg-blue-700/50 text-blue-400 hover:text-blue-300 transition-all duration-200 px-8"
              >
                View Details
              </Button>
            </div>
          ) : isEditing ? (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleCancelEdit}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <Button
                onClick={handleSaveEdit}
                variant="outline"
                className="border border-green-600 bg-transparent hover:bg-green-700/50 text-green-400 hover:text-green-300 transition-all duration-200 px-6"
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onDecline}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Decline
              </button>
              
              {onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
              )}
              
              <Button
                onClick={onApprove}
                variant="outline"
                className="border border-slate-600 bg-transparent hover:bg-slate-700/50 text-slate-200 hover:text-white transition-all duration-200 px-6"
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
