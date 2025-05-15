import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

type SendSolProps = {
  publicKey: WalletContextState['publicKey'];
  sendTransaction: WalletContextState['sendTransaction'];
  connection: Connection;
};

const SEND_SOL_REGEX = /^send\s+(\d+(?:\.\d+)?)\s+sol\s+to\s+([a-zA-Z0-9]{32,44})$/i;

/**
 * Handle the send SOL command and execute the transaction
 * 
 * @param message - The user's command message
 * @param props - Wallet and connection props
 * @returns Response message
 */
export const handleSendSolCommand = async (
  message: string,
  { publicKey, sendTransaction, connection }: SendSolProps
): Promise<string> => {
  if (!publicKey || !sendTransaction) {
    return "❌ Wallet not connected. Please connect your wallet to proceed.";
  }

  const match = message.match(SEND_SOL_REGEX);
  if (!match) {
    return ""; // Not a valid send command
  }

  try {
    const amount = parseFloat(match[1]);
    const recipientAddress = match[2];

    if (amount <= 0) {
      return "❌ Please enter a valid amount greater than 0 SOL.";
    }

    let recipientPublicKey: PublicKey;
    try {
      recipientPublicKey = new PublicKey(recipientAddress);
    } catch (error) {
      return "❌ Invalid recipient address. Please check and try again.";
    }

    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    const estimatedFee = 0.000005;

    if (solBalance < amount + estimatedFee) {
      return `❌ Insufficient balance. You have ${solBalance.toFixed(4)} SOL but are trying to send ${amount} SOL plus transaction fees.`;
    }

    const lamports = amount * LAMPORTS_PER_SOL;
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPublicKey,
        lamports: Math.floor(lamports),
      })
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    const signature = await sendTransaction(transaction, connection);

    const confirmationMessage = `⏳ Transaction submitted! Waiting for confirmation...\nSignature: ${signature}\nSending ${amount} SOL to ${recipientAddress.slice(0, 4)}...${recipientAddress.slice(-4)}`;

    try {
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        return `❌ Transaction submitted but failed: ${confirmation.value.err.toString()}\nSignature: ${signature}`;
      }

      return `✅ Successfully sent ${amount} SOL to ${recipientAddress.slice(0, 4)}...${recipientAddress.slice(-4)}!\n\nTransaction signature: [${signature}](https://explorer.solana.com/tx/${signature})`;
    } catch (confirmError) {
      return `⚠️ Transaction was submitted but confirmation is pending. You can check the status using the signature.\n\n[View on Solana Explorer](https://explorer.solana.com/tx/${signature})`;
    }
  } catch (error) {
    console.error("Send SOL error:", error);
    return `❌ Failed to send SOL: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};
