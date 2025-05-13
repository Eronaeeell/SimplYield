import { Connection, PublicKey, StakeProgram } from "@solana/web3.js";

export async function getUserStakeAccounts(walletPubkey: PublicKey, connection: Connection) {
  const accounts = await connection.getParsedProgramAccounts(StakeProgram.programId, {
    filters: [
      {
        memcmp: {
          offset: 44,
          bytes: walletPubkey.toBase58(),
        },
      },
      {
        dataSize: 200,
      },
    ],
  });

  return accounts.map((acc) => {
    const { pubkey, account } = acc;
    if ("parsed" in account.data) {
      const parsed = account.data.parsed as any;
      return {
        stakePubkey: pubkey,
        lamports: account.lamports,
        status: parsed.info?.stake?.delegation?.activationState || "inactive",
      };
    }
    return {
      stakePubkey: pubkey,
      lamports: account.lamports,
      status: "unknown",
    };
  });
}
