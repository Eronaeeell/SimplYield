    import { Connection, VersionedTransaction, TransactionMessage } from '@solana/web3.js';
import { NativeStakingConfig, NativeStakingSDK } from '@marinade.finance/native-staking-sdk';
import { BN } from 'bn.js';

// Regex patterns to parse staking and unstaking commands
const STAKE_CMD = /^stake\s+(\d+(\.\d+)?)\s*(sol)?$/i;
const UNSTAKE_CMD = /^unstake\s+(\d+(\.\d+)?)?\s*(sol)?$/i;

// Initialize the Marinade Native Staking SDK
const connection = new Connection('https://api.devnet.solana.com');
const sdk = new NativeStakingSDK(new NativeStakingConfig({ connection }));

export const handleStakingCommand = async (input: string, wallet: any) => {
  const match = input.match(STAKE_CMD);
  if (!match || !wallet?.publicKey) return null;

  const amountSol = parseFloat(match[1]);
  const amount = new BN(amountSol * 1e9); // convert SOL to lamports

  const { createAuthorizedStake, stakeKeypair } = sdk.buildCreateAuthorizedStakeInstructions(wallet.publicKey, amount);
  const { blockhash } = await connection.getLatestBlockhash();

  const tx = new VersionedTransaction(
    new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: createAuthorizedStake,
    }).compileToV0Message()
  );

  tx.sign([stakeKeypair]);
  const signedTx = await wallet.signTransaction(tx);
  const txid = await wallet.sendTransaction(signedTx, connection);
  await connection.confirmTransaction(txid, 'finalized');

  return `✅ Successfully staked ${amountSol} SOL. Transaction ID: ${txid}`;
};

export const handleUnstakingCommand = async (input: string, wallet: any) => {
  const match = input.match(UNSTAKE_CMD);
  if (!match || !wallet?.publicKey) return null;

  const amount = match[1] ? new BN(parseFloat(match[1]) * 1e9) : undefined;

  // Prepare the fee payment and receive callback
  const { payFees, onPaid } = await sdk.initPrepareForRevoke(wallet.publicKey, amount);
  const { blockhash } = await connection.getLatestBlockhash();

  // Create a transaction with the payFees instructions
  const tx = new VersionedTransaction(
    new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: payFees,
    }).compileToV0Message()
  );

  // ✅ Ensure proper signing based on wallet adapter capability
  if (wallet.signTransaction) {
    const signedTx = await wallet.signTransaction(tx);
    const txid = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(txid, 'finalized');
    await onPaid(txid);
    return `✅ Unstaking initiated${amount ? ` for ${match[1]} SOL` : ''}. Transaction ID: ${txid}`;
  } else if (wallet.sendTransaction) {
    // fallback for wallet adapters like Phantom
    const txid = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction(txid, 'finalized');
    await onPaid(txid);
    return `✅ Unstaking initiated${amount ? ` for ${match[1]} SOL` : ''}. Transaction ID: ${txid}`;
  } else {
    throw new Error("Wallet does not support transaction signing");
  }
};

