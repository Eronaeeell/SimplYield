"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { StakeProgram, Transaction, PublicKey } from "@solana/web3.js";
import { getUserStakeAccounts } from "@/lib/getUserStakeAccounts";

export default function StakeList() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [stakeAccounts, setStakeAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (publicKey) {
      getUserStakeAccounts(publicKey, connection).then(setStakeAccounts);
    }
  }, [publicKey]);

  const handleUnstake = async (stakePubkey: PublicKey) => {
    if (!publicKey || !signTransaction) return;

    const tx = new Transaction().add(
      StakeProgram.deactivate({
        stakePubkey,
        authorizedPubkey: publicKey,
      })
    );

    tx.feePayer = publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signed = await signTransaction(tx);
    const txid = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(txid, "finalized");
    alert(`✅ Unstake TX sent: ${txid}`);
  };

  if (stakeAccounts.length === 0) {
    return <p className="text-gray-400 text-center">No stake accounts found.</p>;
  }

  return (
    <ul className="space-y-6">
      {stakeAccounts.map(({ stakePubkey, lamports, status }) => (
        <li
          key={stakePubkey.toBase58()}
          className="relative rounded-2xl overflow-hidden border border-indigo-700 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-5 shadow-lg transition transform hover:scale-[1.01]"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 opacity-30 rounded-2xl blur-xl z-0"></div>

          <div className="relative z-10 space-y-2">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">Stake Account:</span>{" "}
              {stakePubkey.toBase58()}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">Balance:</span> {lamports / 1e9} SOL
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">Status:</span>{" "}
              <span
                className={
                  status === "active"
                    ? "text-green-400"
                    : status === "inactive"
                    ? "text-yellow-400"
                    : "text-blue-400"
                }
              >
                {status}
              </span>
            </p>
            <button
              onClick={() => handleUnstake(stakePubkey)}
              className="mt-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
            >
              Unstake
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
