"use client";

import StakeList from "@/components/StakeList";
import { PageTransition } from "@/components/ui/page-transition";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function UnstakePage() {
  const router = useRouter();

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 text-transparent bg-clip-text">
              Manage Stake / Unstake
            </h1>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>

          <p className="text-gray-400 mb-4">
            Below are your active stake accounts. Click "Unstake" to deactivate one.
          </p>

          <StakeList />
        </div>
      </main>
    </PageTransition>
  );
}
