"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  XCircle,
  RefreshCcw,
} from "lucide-react";

// Constants
const MARINADE_PROGRAM_ID = "6NuovUfbN6FoZzbyUCMoGQAvrn8Taz59gzcTgkP5FoUo";
const BLAZESTAKE_PROGRAM_ID = "azFVdHtAJN8BX3sbGAYkXvtdjdrT5U6rj9rovvUFos9";
const MSOL_MINT = "mSoLzboG53NNK9uLhpMo2iLh7CqFDTcRAz2LE5YwL5Q";
const BSOL_MINT = "BLwEAc5qQdRVdS6h9o7H2R5yJNoR2hZs9HzVw2HND9TR";

export function TransactionHistory() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [txData, setTxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("tx-history");
    if (cached) {
      setTxData(JSON.parse(cached));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tx-history", JSON.stringify(txData));
  }, [txData]);

  useEffect(() => {
    if (publicKey && connected) {
      fetchTransactions(publicKey);
    }
  }, [publicKey, connected]);

  const fetchTransactions = async (walletPublicKey: PublicKey) => {
    setLoading(true);
    try {
      const confirmedSignatures = await connection.getSignaturesForAddress(walletPublicKey, { limit: 10 });
      const transactions = await Promise.all(
        confirmedSignatures.map(async (signatureInfo) => {
          try {
            const transaction = await connection.getParsedTransaction(signatureInfo.signature, {
              maxSupportedTransactionVersion: 0,
            });
            if (!transaction) return null;

            const txType = getTransactionType(transaction);
            return {
              id: signatureInfo.signature,
              type: txType,
              amount: getTransactionAmount(transaction),
              coin: getTransactionCoin(txType),
              status: transaction.meta?.err ? "failed" : "completed",
              timestamp: transaction.blockTime
                ? new Date(transaction.blockTime * 1000).toISOString()
                : new Date().toISOString(),
            };
          } catch (err) {
            console.error("Error fetching transaction:", signatureInfo.signature, err);
            return null;
          }
        })
      );

      const validTransactions = transactions.filter((tx) => tx !== null);
      setTxData((prev) => {
        const seen = new Set(validTransactions.map((tx) => tx.id));
        const merged = [...validTransactions, ...prev.filter((tx) => !seen.has(tx.id))];
        return merged;
      });
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionType = (transaction: any): string => {
    const main = transaction?.transaction?.message?.instructions || [];
    const inner = transaction?.meta?.innerInstructions?.flatMap((ix: any) => ix.instructions) || [];
    const instructions = [...main, ...inner];

    for (const instr of instructions) {
      const parsed = instr?.parsed;
      const programId = instr?.programId?.toString();
      const program = instr?.program;

      const info = parsed?.info || {};
      const destination = info?.destination || "";
      const mint = info?.mint || "";

      if (parsed?.type === "delegate") return "stake";
      if (parsed?.type === "deactivate") return "unstake";

      if (programId === MARINADE_PROGRAM_ID || destination === MSOL_MINT || mint === MSOL_MINT)
        return "stake-msol";

      if (programId === BLAZESTAKE_PROGRAM_ID || destination === BSOL_MINT || mint === BSOL_MINT)
        return "stake-bsol";

      if (parsed?.type === "transfer") {
        if (info?.destination === publicKey?.toBase58()) return "receive";
        if (info?.source === publicKey?.toBase58()) return "send";
      }
    }

    if (transaction?.meta?.err) return "cancel";
    return "unknown";
  };

  const getTransactionCoin = (type: string): string => {
    if (type.includes("msol")) return "mSOL";
    if (type.includes("bsol")) return "bSOL";
    return "SOL";
  };

  const getTransactionAmount = (transaction: any): string => {
    const instructions = transaction?.transaction?.message?.instructions || [];

    for (const instr of instructions) {
      const lamports = instr?.parsed?.info?.lamports;
      if (lamports) return (lamports / 1e9).toFixed(2);
    }

    const pre = transaction?.meta?.preBalances?.[0];
    const post = transaction?.meta?.postBalances?.[0];
    if (pre !== undefined && post !== undefined) {
      const diff = Math.abs(pre - post);
      return (diff / 1e9).toFixed(2);
    }

    return "0";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "stake":
      case "stake-msol":
      case "stake-bsol":
        return <ArrowUpRight className="h-4 w-4 text-green-400" />;
      case "unstake":
      case "unstake-bsol":
        return <ArrowDownLeft className="h-4 w-4 text-red-400" />;
      case "send":
        return <ArrowUpRight className="h-4 w-4 text-yellow-400" />;
      case "receive":
        return <ArrowDownLeft className="h-4 w-4 text-teal-400" />;
      case "cancel":
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      case "cancel":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTransactionLabel = (tx: any) => {
    switch (tx.type) {
      case "stake":
        return `Staked ${tx.amount} ${tx.coin}`;
      case "unstake":
        return `Unstaked ${tx.amount} ${tx.coin}`;
      case "stake-msol":
        return `Staked ${tx.amount} SOL to mSOL`;
      case "stake-bsol":
        return `Staked ${tx.amount} SOL to bSOL`;
      case "unstake-bsol":
        return `Unstaked bSOL to SOL`;
      case "send":
        return `Sent ${tx.amount} ${tx.coin}`;
      case "receive":
        return `Received ${tx.amount} ${tx.coin}`;
      case "cancel":
        return "Transaction Canceled";
      default:
        return `${tx.type} ${tx.amount} ${tx.coin}`;
    }
  };

  const handleRefresh = () => {
    if (publicKey && connected) {
      fetchTransactions(publicKey);
    }
  };

  return (
    <ScrollArea className="h-[320px]">
      <div className="px-4 py-2">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center text-white border border-blue-600 rounded-full px-3 py-1 text-sm"
          >
            <RefreshCcw className="h-3 w-3 mr-1" /> Refresh
          </button>
        </div>
        {txData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions yet</div>
        ) : (
          <div className="space-y-4">
            {txData.map((tx) => (
              <div
                key={tx.id}
                className="flex items-start space-x-3 py-2 border-b border-gray-700 last:border-0"
              >
                <div className="p-2 rounded-full bg-gray-700/50 mt-1">
                  {getTransactionIcon(tx.type)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm text-white truncate">
                      {getTransactionLabel(tx)}
                    </h4>
                    <Badge className={getStatusColor(tx.status)}>
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      {formatDate(tx.timestamp)}
                    </p>
                    <p className="text-xs font-medium">
                      ID: {tx.id.substring(0, 6)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
