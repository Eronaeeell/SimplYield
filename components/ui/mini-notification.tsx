import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Connection, PublicKey } from "@solana/web3.js"
import { handleStakingCommand } from "@/stake-unstake/SOL/native-stake-SOL"
import { handleStakeToMSOLCommand } from "@/stake-unstake/mSOL/liquid-stake-mSOL"
import { handleStakeToBSOLCommand } from "@/stake-unstake/bSOL/stake-to-bsol"

type Props = {
    isVisible: boolean
    amount: number
    onClose: () => void
    wallet: {
        publicKey: PublicKey | null
        signTransaction: any
        sendTransaction: any
    }
    connection: Connection
}

export function MiniNotification({ isVisible, amount, onClose, wallet, connection }: Props) {
    const [stakingMode, setStakingMode] = useState(false)
    const [inputAmount, setInputAmount] = useState("")
    const [showTokens, setShowTokens] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isVisible) {
            setStakingMode(false)
            setInputAmount("")
            setShowTokens(false)
            setStatusMessage("")
            setLoading(false)

            timeoutRef.current = setTimeout(() => {
                onClose()
            }, 15000)

            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
            }
        }
    }, [isVisible, onClose])

    useEffect(() => {
        if (stakingMode && timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [stakingMode])

    const parsedAmount = parseFloat(inputAmount)
    const isValid = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= amount

    const handleStakeSol = async () => {
        if (!isValid || !wallet?.publicKey) return

        setLoading(true)
        const result = await handleStakingCommand(`stake ${parsedAmount}`, wallet)
        setStatusMessage(result ?? "Something went wrong.")
        setLoading(false)
    }

    const handleStakeMSOL = async () => {
        if (!isValid || !wallet?.publicKey || !wallet?.sendTransaction) return

        setLoading(true)
        const ctx = {
            publicKey: wallet.publicKey,
            connection,
            sendTransaction: wallet.sendTransaction,
            signTransaction: wallet.signTransaction,
        }

        const result = await handleStakeToMSOLCommand(`stake ${parsedAmount} sol to msol`, ctx)
        setStatusMessage(result ?? "Something went wrong.")
        setLoading(false)
    }

    const handleStakeBSOL = async () => {
        if (!isValid || !wallet?.publicKey || !wallet?.signTransaction) return

        setLoading(true)

        const ctx = {
            publicKey: wallet.publicKey,
            connection,
            signTransaction: wallet.signTransaction,
        }

        const result = await handleStakeToBSOLCommand(`stake ${parsedAmount} sol to bsol`, ctx)
        setStatusMessage(result ?? "Something went wrong.")
        setLoading(false)
    }

    if (!isVisible) return null

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-6 right-6 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 w-80"
        >
            {/* Close "X" button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-white text-sm font-bold focus:outline-none"
            >
                ×
            </button>

            {statusMessage ? (
                <div className="text-sm text-gray-200 whitespace-pre-line">{statusMessage}</div>
            ) : !stakingMode ? (
                <>
                    <div className="text-white font-semibold mb-2">🎉 You received {amount} SOL</div>
                    <div className="text-sm text-gray-300 mb-4">Would you like to stake it now?</div>
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-3 py-1.5 bg-purple-600 rounded text-white text-sm hover:bg-purple-700"
                            onClick={() => setStakingMode(true)}
                        >
                            Continue to Stake
                        </button>
                        <button
                            className="px-3 py-1.5 bg-gray-700 rounded text-gray-300 text-sm hover:bg-gray-600"
                            onClick={onClose}
                        >
                            Skip for now
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="text-white font-semibold mb-2">Enter amount to stake</div>
                    <input
                        type="number"
                        value={inputAmount}
                        onChange={(e) => setInputAmount(e.target.value)}
                        placeholder={`Max ${amount}`}
                        className="w-full px-3 py-2 rounded bg-gray-700 text-white text-sm mb-3 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                        disabled={!isValid}
                        onClick={() => setShowTokens(true)}
                        className={`w-full py-2 text-sm rounded font-semibold transition ${isValid
                                ? "bg-purple-600 text-white hover:bg-purple-700"
                                : "bg-gray-700 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Choose token to stake
                    </button>

                    {showTokens && (
                        <div className="mt-4 space-y-2">
                            <div className="text-sm text-gray-400 mb-1">Choose staking token:</div>
                            <div className="flex justify-between gap-2">
                                <button
                                    disabled={loading}
                                    onClick={handleStakeSol}
                                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                                >
                                    SOL
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={handleStakeMSOL}
                                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                                >
                                    mSOL
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={handleStakeBSOL}
                                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                                >
                                    bSOL
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    )
}
