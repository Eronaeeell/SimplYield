// import {
//   Connection,
//   PublicKey,
//   Transaction,
//   SystemProgram,
//   LAMPORTS_PER_SOL,
//   sendAndConfirmRawTransaction,
// } from '@solana/web3.js'
// import {
//   stakePoolInfo,
//   depositSol
// } from '@solana/spl-stake-pool'
// import {
//   getAssociatedTokenAddress
// } from '@solana/spl-token'

// const DEVNET_RPC = 'https://api.devnet.solana.com'
// const BLAZESTAKE_POOL = new PublicKey("azFVdHtAJN8BX3sbGAYkXvtdjdrT5U6rj9rovvUFos9")
// const BSOL_MINT = new PublicKey("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1")
// const SOLPAY_API_ACTIVATION = new PublicKey("7f18MLpvAp48ifA1B8q8FBdrGQhyt9u5Lku2VBYejzJL")

// export async function handleStakeToBSOLCommand(
//   input: string,
//   { publicKey, signTransaction }: { publicKey: PublicKey | null; signTransaction: any }
// ): Promise<string> {
//   if (!publicKey) return "❌ Wallet not connected."

//   const match = input.match(/^stake\s+(\d+(\.\d+)?)\s+sol\s+to\s+bsol$/i)
//   if (!match) return "❌ Invalid format. Try: `stake 0.5 sol to bsol`"

//   const amountSol = parseFloat(match[1])
//   const lamports = amountSol * LAMPORTS_PER_SOL

//   const connection = new Connection(DEVNET_RPC, 'confirmed')

//   try {
//     // Get bSOL token account for wallet
//     const userBSolATA = await getAssociatedTokenAddress(
//       BSOL_MINT,
//       publicKey,
//       false
//     )

//     // Get stake pool info
//     const info = await stakePoolInfo(connection, BLAZESTAKE_POOL)
//     if (info.details.updateRequired) {
//       await fetch('https://stake.solblaze.org/api/v1/update_pool?network=devnet')
//     }

//     // Stats
//     let solanaAmount = BigInt(info.details?.reserveStakeLamports ?? 0)
//     for (let i = 0; i < (info.details?.stakeAccounts?.length ?? 0); i++) {
//       const lamports = info.details!.stakeAccounts![i].validatorLamports ?? "0"
//       solanaAmount += BigInt(lamports)
//     } 

//     const tokenAmount = BigInt(info.poolTokenSupply)
//     const conversion = Number(solanaAmount) / Number(tokenAmount)

//     const validatorRes = await fetch("https://stake.solblaze.org/api/v1/validator_count")
//     const { count: validators } = await validatorRes.json()

//     // Stake
//     const depositTx = await depositSol(
//       connection,
//       BLAZESTAKE_POOL,
//       publicKey,
//       lamports,
//       userBSolATA, // ✅ Explicitly pass bSOL token account
//       publicKey
//     )

//     const tx = new Transaction()
//     tx.add(SystemProgram.transfer({
//       fromPubkey: publicKey,
//       toPubkey: SOLPAY_API_ACTIVATION,
//       lamports: 5000
//     }))
//     tx.add(...depositTx.instructions)

//     tx.feePayer = publicKey
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

//     if (depositTx.signers.length > 0) {
//       tx.partialSign(...depositTx.signers)
//     }

//     const signed = await signTransaction(tx)
//     const txid = await sendAndConfirmRawTransaction(connection, signed.serialize())

//     return `✅ Successfully staked ${amountSol} SOL to bSOL.\n\n` +
//            `🔁 Conversion rate: 1 bSOL ≈ ${conversion.toFixed(4)} SOL\n` +
//            `📊 Validators: ${validators}\n` +
//            `🔗 [View on Solscan](https://solscan.io/tx/${txid}?cluster=devnet)`
//   } catch (err: unknown) {
//     console.error('Stake to bSOL error:', err)
//     const message = err instanceof Error ? err.message : String(err)
//     return `❌ Failed to stake to bSOL: ${message}`
//   }
// }
