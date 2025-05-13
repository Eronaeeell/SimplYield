import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk'
import { Connection, PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

export async function handleStakeToMSOLCommand(
  input: string,
  {
    publicKey,
    signTransaction,
    sendTransaction,
    connection,
  }: {
    publicKey: PublicKey | null
    signTransaction: any
    sendTransaction: any
    connection: Connection
  }
): Promise<string | null> {
  if (!publicKey) return "❌ Wallet not connected."

  const match = input.match(/^stake\s+(\d+(\.\d+)?)\s+sol\s+to\s+msol$/i)
  if (!match) return "❌ Invalid format. Use: `stake 1 sol to msol`"

  const amount = parseFloat(match[1])
  const lamports = new BN(Math.floor(amount * 1_000_000_000))

  try {
    const config = new MarinadeConfig({ connection, publicKey })
    const marinade = new Marinade(config)

    const { transaction } = await marinade.deposit(lamports) // ✅ No extra BN wrapper
    const signature = await sendTransaction(transaction, connection)

    return `✅ Staked ${amount} SOL to mSOL.\n🔗 [View Transaction](https://explorer.solana.com/tx/${signature}?cluster=devnet)`
  } catch (err) {
    console.error("Stake to mSOL error:", err)
    const message = err instanceof Error ? err.message : String(err)
    return `❌ Failed to stake SOL to mSOL: ${message}`
  }
}
