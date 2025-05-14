import {
  Connection,
  PublicKey,
  StakeProgram,
  ParsedAccountData,
} from '@solana/web3.js'

export async function getUserStakeAccounts(
  userPublicKey: PublicKey,
  connection: Connection
) {
  const stakeAccounts = await connection.getParsedProgramAccounts(StakeProgram.programId, {
    filters: [
      {
        memcmp: {
          offset: 44,
          bytes: userPublicKey.toBase58(),
        },
      },
    ],
  });

  return stakeAccounts
    .filter(({ account }) => account.data instanceof Object && 'parsed' in account.data)
    .map(({ pubkey, account }) => {
      const lamports = account.lamports;
      const parsedData = account.data as ParsedAccountData;
      const info = parsedData.parsed.info;

      let status = 'inactive';
      try {
        const delegation = info?.stake?.delegation;
        if (delegation) {
          if (delegation.deactivationEpoch === '18446744073709551615') {
            status = 'active';
          } else {
            status = 'deactivating';
          }
        }
      } catch {
        status = 'inactive';
      }

      return {
        stakePubkey: pubkey,
        lamports,
        status,
      };
    });
}
