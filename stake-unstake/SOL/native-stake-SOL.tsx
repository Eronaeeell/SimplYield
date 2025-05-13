import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  StakeProgram,
  Authorized,
  Lockup,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { getUserStakeAccounts } from '@/lib/getUserStakeAccounts';

const STAKE_CMD = /^stake\s+(\d+(\.\d+)?)\s*(sol)?$/i;
const UNSTAKE_CMD = /^unstake\s+(\d+(\.\d+)?)?\s*(sol)?$/i;

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const VALIDATOR_VOTE_ACCOUNT = new PublicKey('FwR3PbjS5iyqzLiLugrBqKSa5EKZ4vK9SKs7eQXtT59f');

let cachedStakeAccounts: any[] = [];

export const handleStakingCommand = async (input: string, wallet: any) => {
  const match = input.match(STAKE_CMD);
  if (!match || !wallet?.publicKey) return null;

  const amountSol = parseFloat(match[1]);
  const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
  const stakeAccount = Keypair.generate();

  const authorized = new Authorized(wallet.publicKey, wallet.publicKey);
  const lockup = new Lockup(0, 0, wallet.publicKey);

  const instructions: TransactionInstruction[] = [
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: stakeAccount.publicKey,
      lamports: amountLamports,
      space: 200,
      programId: StakeProgram.programId,
    }),
    StakeProgram.initialize({
      stakePubkey: stakeAccount.publicKey,
      authorized,
      lockup,
    }),
  //   StakeProgram.delegate({
  //     stakePubkey: stakeAccount.publicKey,
  //     authorizedPubkey: wallet.publicKey,
  //     votePubkey: VALIDATOR_VOTE_ACCOUNT,
  //   }),
  ];

  const latestBlockhash = await connection.getLatestBlockhash();
  const tx = new Transaction().add(...instructions);
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = latestBlockhash.blockhash;

  tx.partialSign(stakeAccount);
 try {
  const signedTx = await wallet.signTransaction(tx);
  const txid = await connection.sendRawTransaction(signedTx.serialize());

  await connection.confirmTransaction({
    signature: txid,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });

  return `✅ Staked ${amountSol} SOL\n🔗 https://solscan.io/tx/${txid}?cluster=devnet`;
} catch (err: any) {
  if (err.message?.includes("User rejected") || err.message?.includes("Transaction was rejected")) {
    return '❎ Stake cancelled by user.';
  }
  console.error('Stake transaction failed:', err);
  return '❌ Failed to stake. Please try again.';
} 
}

export const handleUnstakingCommand = async (input: string, wallet: any) => {
  if (!wallet?.publicKey) return "❌ Wallet not connected.";

  const unstakeNumber = input.match(/^unstake\s+(\d+)$/i);

  if (unstakeNumber && cachedStakeAccounts.length > 0) {
    const index = parseInt(unstakeNumber[1]) - 1;
    const selected = cachedStakeAccounts[index];
    if (!selected) return "❌ Invalid selection.";

    const latestBlockhash = await connection.getLatestBlockhash();
    const tx = new Transaction().add(
      StakeProgram.deactivate({
        stakePubkey: selected.stakePubkey,
        authorizedPubkey: wallet.publicKey,
      })
    );

    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = latestBlockhash.blockhash;

    const signed = await wallet.signTransaction(tx);
    const txid = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction({
      signature: txid,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    cachedStakeAccounts = [];

    return `✅ Unstaking initiated for ${selected.stakePubkey.toBase58()}\n🔗 https://solscan.io/tx/${txid}?cluster=devnet`;
  }

  if (/^unstake$/i.test(input)) {
    const allAccounts = await getUserStakeAccounts(wallet.publicKey, connection);
    const active = allAccounts.filter((a) => a.status === 'active');
    if (active.length === 0) return "❌ No active stake accounts found.";

    cachedStakeAccounts = active;
    const list = active.map((acc, i) => {
    const short = acc.stakePubkey.toBase58();
    const amount = (acc.lamports / LAMPORTS_PER_SOL).toFixed(2);
    return `🔹 \`${i + 1}\`  —  **${amount} SOL**\n     🆔 \`${short.slice(0, 4)}...${short.slice(-4)}\``;
  }).join("\n\n");  

  return (
    `🔍 **Found ${active.length} active stake account(s):**\n\n` +
    list +
    `\n\n👉 Type \`unstake 1\`, \`unstake 2\`, etc. to proceed.`
  );
  }

  return null;
};
