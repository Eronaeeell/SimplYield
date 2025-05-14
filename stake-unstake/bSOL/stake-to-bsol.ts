// import {
//   Connection,
//   PublicKey,
//   SystemProgram,
//   Transaction,
//   sendAndConfirmRawTransaction,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js"
// import {
//   depositSol,
//   stakePoolInfo,
// } from "@solana/spl-stake-pool"
// import {
//   getAssociatedTokenAddressSync,
//   createAssociatedTokenAccountInstruction,
//   TOKEN_PROGRAM_ID,
//   ASSOCIATED_TOKEN_PROGRAM_ID,
// } from "@solana/spl-token"
// import fetch from "node-fetch"

// const BLAZESTAKE_POOL_DEVNET = new PublicKey(
//   "azFVdHtAJN8BX3sbGAYkXvtdjdrT5U6rj9rovvUFos9"
// )
// const SOLPAY_API_ACTIVATION = new PublicKey(
//   "7f18MLpvAp48ifA1B8q8FBdrGQhyt9u5Lku2VBYejzJL"
// )
// const BSOL_MINT = new PublicKey(
//   "BLwZ9zk9z3yzfeuYAvKQSkGpWvCZDkH4dAdk9ZGx8yNM"
// )

// export async function handleStakeToBSOLCommand(
//   input: string,
//   {
//     publicKey,
//     signTransaction,
//     connection,
//   }: {
//     publicKey: PublicKey
//     signTransaction: (tx: Transaction) => Promise<Transaction>
//     connection: Connection
//   }
// ): Promise<string | null> {
//   try {
//     const match = input.match(/stake\s+(\d+(?:\.\d+)?)\s+sol\s+to\s+bsol/i)
//     if (!match) return null

//     const amount = parseFloat(match[1])
//     if (amount <= 0) return "❌ Amount must be greater than 0 SOL."
//     const lamports = amount * LAMPORTS_PER_SOL

//     const info = await stakePoolInfo(connection, BLAZESTAKE_POOL_DEVNET)
//     if (info.details.updateRequired) {
//       const res = await fetch(
//         "https://stake.solblaze.org/api/v1/update_pool?network=devnet"
//       )
//       const json = await res.json()
//       if (!json.success) throw new Error("Stake pool update failed")
//     }

//     const depositTx = await depositSol(
//       connection,
//       BLAZESTAKE_POOL_DEVNET,
//       publicKey,
//       lamports,
//       undefined,
//       publicKey
//     )

//     const transaction = new Transaction()

//     // Tip to Blaze crank
//     transaction.add(
//       SystemProgram.transfer({
//         fromPubkey: publicKey,
//         toPubkey: SOLPAY_API_ACTIVATION,
//         lamports: 5000,
//       })
//     )

//     // Create ATA for bSOL if needed
//     const bsolATA = getAssociatedTokenAddressSync(
//       BSOL_MINT,
//       publicKey,
//       false,
//       TOKEN_PROGRAM_ID,
//       ASSOCIATED_TOKEN_PROGRAM_ID
//     )

//     const accountInfo = await connection.getAccountInfo(bsolATA)

//     if (!accountInfo) {
//       transaction.add(
//         createAssociatedTokenAccountInstruction(
//           publicKey,
//           bsolATA,
//           publicKey,
//           BSOL_MINT,
//           TOKEN_PROGRAM_ID,
//           ASSOCIATED_TOKEN_PROGRAM_ID
//         )
//       )
//     }

//     // Add staking instructions
//     transaction.add(...depositTx.instructions)

//     // Set recent blockhash & fee payer
//     const latestBlockhash = await connection.getLatestBlockhash()
//     transaction.recentBlockhash = latestBlockhash.blockhash
//     transaction.feePayer = publicKey

//     if (depositTx.signers.length > 0) {
//       transaction.partialSign(...depositTx.signers)
//     }

//     const signedTx = await signTransaction(transaction)
//     const txid = await connection.sendRawTransaction(signedTx.serialize(), {
//       skipPreflight: false,
//       preflightCommitment: "confirmed",
//     })

//     return `\u2705 Successfully staked ${amount} SOL to bSOL!\n\n\ud83d\udd17 [View on Solana Explorer](https://explorer.solana.com/tx/${txid}?cluster=devnet)`
//   } catch (err: any) {
//     console.error("Stake to bSOL error:", err?.message || err)
//     return `\u274c Failed to stake SOL to bSOL.\n\n**Error:** ${err?.message || err}`
//   }
// }