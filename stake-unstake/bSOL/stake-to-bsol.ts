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
    console.log('🔵 bSOL handler received input:', input);
    console.log('🔵 Input type:', typeof input);
    console.log('🔵 Input trimmed:', input.trim());
    
    // === STAKE FLOW ===
    const stakeMatch = input.match(/^stake\s+(\d+(\.\d+)?)\s+sol\s+to\s+bsol$/i);
    console.log('🔵 Stake match result:', stakeMatch);
    
    if (stakeMatch) {
      const amount = parseFloat(stakeMatch[1]);
      console.log('🔵 Staking amount:', amount);
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // Get or create the user's bSOL associated token account using depositSol
      // depositSol will handle ATA creation automatically
      const depositTx = await depositSol(
        connection,
        BLAZESTAKE_POOL,
        publicKey,
        lamports
      );

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const transaction = new Transaction({
        recentBlockhash: latestBlockhash.blockhash,
        feePayer: publicKey,
      });
      transaction.add(...depositTx.instructions);
      if (depositTx.signers.length > 0) transaction.partialSign(...depositTx.signers);

      console.log('🔵 Requesting wallet signature...');
      const signedTx = await signTransaction(transaction);
      console.log('🔵 Transaction signed, sending...');
      const txid = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      console.log('🔵 Transaction sent:', txid);

      return `✅ Successfully staked ${amount} SOL to bSOL!\n 🔗[View transaction](https://explorer.solana.com/tx/${txid}?cluster=devnet)`;
    }

    // === UNSTAKE DETECTION ===
    if (input.trim().toLowerCase() === "unstake bsol") {
      try {
        // Use getParsedTokenAccountsByOwner to get bSOL balance
        const bsolAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: BSOL_MINT,
        });
        
        if (bsolAccounts.value.length === 0) {
          return `⚠️ No bSOL found in your wallet.`;
        }
        
        const accountInfo = bsolAccounts.value[0].account.data.parsed.info.tokenAmount;
        const amount = parseFloat(accountInfo.uiAmountString || '0');
        lastDetectedBSOLAmount = amount;
        return `🪙 You currently hold **${amount.toFixed(4)} bSOL**.\nType:\n\`unstake {amount} bsol\` to proceed.`;
      } catch (e) {
        console.error('Error fetching bSOL balance:', e);
        return `⚠️ No bSOL found in your wallet.`;
      }
    }

    // === UNSTAKE EXECUTION ===
    const unstakeMatch = input.match(/^unstake\s+(\d+(\.\d+)?)\s+bsol$/i);
    if (unstakeMatch) {
      const amount = parseFloat(unstakeMatch[1]);

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
