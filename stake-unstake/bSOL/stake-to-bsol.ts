import {
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getStakePoolAccount,
  depositSol,
  withdrawSol,
} from "@solana/spl-stake-pool";
import {
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";

const BLAZESTAKE_POOL = new PublicKey("azFVdHtAJN8BX3sbGAYkXvtdjdrT5U6rj9rovvUFos9");
const BSOL_MINT = new PublicKey("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1");

let lastDetectedBSOLAmount = 0;

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
    // === STAKE FLOW ===
    const stakeMatch = input.match(/^stake\s+(\d+(\.\d+)?)\s+sol\s+to\s+bsol$/i);
    if (stakeMatch) {
      const amount = parseFloat(stakeMatch[1]);
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      const userBSolATA = await getAssociatedTokenAddress(BSOL_MINT, publicKey);

      const depositTx = await depositSol(
        connection,
        BLAZESTAKE_POOL,
        publicKey,
        lamports,
        undefined,
        userBSolATA
      );

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const transaction = new Transaction({
        recentBlockhash: latestBlockhash.blockhash,
        feePayer: publicKey,
      });
      transaction.add(...depositTx.instructions);
      if (depositTx.signers.length > 0) transaction.partialSign(...depositTx.signers);

      const signedTx = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      return `✅ Successfully staked ${amount} SOL to bSOL!\n 🔗[View transaction](https://explorer.solana.com/tx/${txid}?cluster=devnet)`;
    }

    // === UNSTAKE DETECTION ===
    if (input.trim().toLowerCase() === "unstake bsol") {
      const userBSolATA = await getAssociatedTokenAddress(BSOL_MINT, publicKey);
      try {
        const account = await getAccount(connection, userBSolATA);
        const amount = Number(account.amount) / LAMPORTS_PER_SOL;
        lastDetectedBSOLAmount = amount;
        return `🪙 You currently hold **${amount.toFixed(4)} bSOL**.\nType:\n\`unstake {amount} bsol\` to proceed.`;
      } catch (e) {
        return `⚠️ No bSOL found in your wallet.`;
      }
    }

    // === UNSTAKE EXECUTION ===
    const unstakeMatch = input.match(/^unstake\s+(\d+(\.\d+)?)\s+bsol$/i);
    if (unstakeMatch) {
      const amount = parseFloat(unstakeMatch[1]);
      if (amount > lastDetectedBSOLAmount) {
        return `❌ You only have ${lastDetectedBSOLAmount.toFixed(4)} bSOL.`;
      }

      const withdrawTx = await withdrawSol(
        connection,
        BLAZESTAKE_POOL,
        publicKey,
        publicKey,
        amount
      );

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const transaction = new Transaction({
        recentBlockhash: latestBlockhash.blockhash,
        feePayer: publicKey,
      });
      transaction.add(...withdrawTx.instructions);
      if (withdrawTx.signers.length > 0) transaction.partialSign(...withdrawTx.signers);

      const signedTx = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      return `✅ Successfully unstaked ${amount} bSOL to SOL!\n 🔗[View transaction](https://explorer.solana.com/tx/${txid}?cluster=devnet)`;
    }

    return `🤖 I didn’t understand that bSOL command. Try:\n- stake 1 sol to bsol\n- unstake bsol\n- unstake 0.5 bsol`;

  } catch (err: any) {
    console.error("bSOL stake/unstake error:", err);
    return `❌ Failed: ${err.message || err}`;
  }
}
