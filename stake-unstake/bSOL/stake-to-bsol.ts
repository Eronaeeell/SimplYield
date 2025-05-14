import {
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getStakePoolAccount,
  stakePoolInfo,
  updateStakePool,
  depositSol,
} from "@solana/spl-stake-pool";
import { getAssociatedTokenAddress } from "@solana/spl-token";

/**
 * Handles the command "stake X sol to bsol"
 */
export async function handleStakeToBSOLCommand(
  input: string,
  {
    publicKey,
    signTransaction,
    connection,
  }: {
    publicKey: PublicKey;
    signTransaction: (tx: Transaction) => Promise<Transaction>;
    connection: Connection;
  }
): Promise<string> {
  try {
    const match = input.match(/^stake\s+(\d+(\.\d+)?)\s+sol\s+to\s+bsol$/i);
    if (!match) return "❌ Invalid command format. Try `stake 1 sol to bsol`.";

    const amount = parseFloat(match[1]);
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    // BlazeStake pool address on Devnet
    const BLAZESTAKE_POOL = new PublicKey("azFVdHtAJN8BX3sbGAYkXvtdjdrT5U6rj9rovvUFos9");

    // 1. Load stake pool account data
    const stakePoolAccount = await getStakePoolAccount(connection, BLAZESTAKE_POOL);
    const BSOL_MINT = new PublicKey("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1");
    const userBSolATA = await getAssociatedTokenAddress(BSOL_MINT, publicKey);

    // // 2. Check for update requirement
    // const info = await stakePoolInfo(connection, stakePoolAccount);
    // if (info.details.updateRequired) {
    //   await updateStakePool(connection, BLAZESTAKE_POOL, publicKey);
    // }

    // 3. Prepare the staking transaction
    const depositTx = await depositSol(
      connection,
      BLAZESTAKE_POOL,
      publicKey,
      lamports,
      undefined,
      userBSolATA // instead of publicKey
    );

    // 4. Get a recent blockhash
    const latestBlockhash = await connection.getLatestBlockhash("confirmed");

    // 5. Build transaction with blockhash and fee payer
    const transaction = new Transaction({
      recentBlockhash: latestBlockhash.blockhash,
      feePayer: publicKey,
    });
    transaction.add(...depositTx.instructions);

    // 6. Partial sign with any required signers
    if (depositTx.signers.length > 0) {
      transaction.partialSign(...depositTx.signers);
    }

    // 7. Let the wallet sign the full transaction
    const signedTx = await signTransaction(transaction);

    // 8. Send the transaction to the network
    const txid = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    return `✅ Successfully staked ${amount} SOL to bSOL!\n 🔗[View transaction](https://explorer.solana.com/tx/${txid}?cluster=devnet)`;
  } catch (err: any) {
    console.error("bSOL staking error:", err);
    return `❌ Failed to stake to bSOL: ${err.message || err}`;
  }
}
