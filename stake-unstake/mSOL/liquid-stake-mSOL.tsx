import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import BN from 'bn.js'

type Context = {
  publicKey: PublicKey | null
  signTransaction: any
  sendTransaction: any
  connection: Connection
}

let msolUnstakeOptions: {
  index: number
  amount: number
  lamports: BN
}[] = []

export async function handleStakeToMSOLCommand(input: string, ctx: Context): Promise<string | null> {
  const { publicKey, connection, sendTransaction } = ctx
  if (!publicKey) return "❌ Wallet not connected."

  const match = input.match(/^stake\s+(\d+(?:\.\d+)?)\s+sol\s+to\s+msol$/i)
  if (!match) return "❌ Invalid format. Use: `stake 1 sol to msol`"

  const amount = parseFloat(match[1])
  const lamports = new BN(Math.floor(amount * 1_000_000_000))

  try {
    const config = new MarinadeConfig({ connection, publicKey })
    const marinade = new Marinade(config)

    const { transaction } = await marinade.deposit(lamports)
    const signature = await sendTransaction(transaction, connection)

    return `✅ Staked ${amount} SOL to mSOL.\n🔗 [View Transaction](https://explorer.solana.com/tx/${signature}?cluster=devnet)`
  } catch (err) {
    console.error("Stake to mSOL error:", err)
    return `❌ Failed to stake SOL to mSOL: ${err instanceof Error ? err.message : String(err)}`
  }
}

export async function handleUnstakeMSOLCommand(input: string, ctx: Context): Promise<string | null> {
  const { publicKey, connection, sendTransaction } = ctx
  if (!publicKey) return "❌ Wallet not connected."

  const config = new MarinadeConfig({ connection, publicKey })
  const marinade = new Marinade(config)
  const marinadeState = await marinade.getMarinadeState()

  // Detect balance
  const msolAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
    mint: marinadeState.mSolMint.address,
  })
  const accountInfo = msolAccounts.value[0]?.account.data.parsed.info.tokenAmount
  const msolBalance = parseFloat(accountInfo?.uiAmountString || '0')

  // 1. User types: "unstake msol" => show balance
  if (input.trim().toLowerCase() === "unstake msol") {
    if (msolBalance === 0) return "❌ You have no mSOL to unstake."
    return `🔍 You currently have ${msolBalance.toFixed(4)} mSOL.\n💬 Type \`unstake [amount] msol\` to proceed.`
  }

  // 2. User types: "unstake 1.5 msol"
  const amountMatch = input.match(/^unstake\s+(\d+(\.\d+)?)\s+msol$/i)
  if (amountMatch) {
    const amount = parseFloat(amountMatch[1])
    if (amount > msolBalance) return `❌ You only have ${msolBalance.toFixed(4)} mSOL.`

    try {
  const lamports = new BN(Math.floor(amount * 1_000_000_000))
  const { transaction } = await marinade.liquidUnstake(lamports)

  console.log("💡 Liquid unstake TX:", transaction)

  const sig = await sendTransaction(transaction, connection)
  return `✅ Unstaked ${amount} mSOL.\n🔗 [View Transaction](https://explorer.solana.com/tx/${sig}?cluster=devnet)`
}catch (err) {
  console.error("Unstake error:", err)

  let message: string
  if (err instanceof Error) {
    message = err.message
  } else if (typeof err === "object") {
    message = JSON.stringify(err, null, 2) // readable output
  } else {
    message = String(err)
  }

  return `❌ Error: ${message}`
}
  }
  return null
}
