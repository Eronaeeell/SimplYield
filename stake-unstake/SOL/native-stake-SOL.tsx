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
  TransactionInstruction
} from '@solana/web3.js';

// Regex for CLI-style command matching
const STAKE_CMD = /^stake\s+(\d+(\.\d+)?)\s*(sol)?$/i;
const UNSTAKE_CMD = /^unstake\s+(\d+(\.\d+)?)?\s*(sol)?$/i;

// Solana Devnet RPC
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Example Devnet validator vote account
const VALIDATOR_VOTE_ACCOUNT = new PublicKey('8pPNjm5F2xGUG8q7fFwNLcDmAnMDRamEotiDZbJ5seqo');

// Track stake account for unstaking (demo only)
let lastStakeAccount: Keypair | null = null;

export const handleStakingCommand = async (input: string, wallet: any) => {
  const match = input.match(STAKE_CMD);
  if (!match || !wallet?.publicKey) return null;

  const amountSol = parseFloat(match[1]);
  const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

  const stakeAccount = Keypair.generate();
  lastStakeAccount = stakeAccount;

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
    /*
    StakeProgram.delegate({
      stakePubkey: stakeAccount.publicKey,
      authorizedPubkey: wallet.publicKey,
      votePubkey: VALIDATOR_VOTE_ACCOUNT,
    }),*/
  ];

  const tx = new Transaction().add(...instructions);
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  // Sign with the new stake account
  tx.partialSign(stakeAccount);

  // Wallet signs for fee payer
  const signedTx = await wallet.signTransaction(tx);
  const txid = await connection.sendRawTransaction(signedTx.serialize());
  await connection.confirmTransaction(txid, 'finalized');

  return `✅ Staked ${amountSol} SOL\n🔗 https://solscan.io/tx/${txid}?cluster=devnet`;
};

export const handleUnstakingCommand = async (_: string, wallet: any) => {
  if (!wallet?.publicKey || !lastStakeAccount) {
    return '❌ No stake account found. Stake first before unstaking.';
  }

  const stakePubkey = lastStakeAccount.publicKey;

  const instruction = StakeProgram.deactivate({
    stakePubkey,
    authorizedPubkey: wallet.publicKey,
  });

  const tx = new Transaction().add(instruction);
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signedTx = await wallet.signTransaction(tx);
  const txid = await connection.sendRawTransaction(signedTx.serialize());
  await connection.confirmTransaction(txid, 'finalized');

  return `✅ Unstaking started for ${stakePubkey.toBase58()}\n🔗 https://solscan.io/tx/${txid}?cluster=devnet\n🕒 Wait ~2 epochs before withdrawal.`;
};
