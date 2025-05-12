"use client";
import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter
} from '@solana/wallet-adapter-phantom';
import {
    BackpackWalletAdapter
} from '@solana/wallet-adapter-backpack';
import {
    SolflareWalletAdapter
} from '@solana/wallet-adapter-solflare';
import {
    TorusWalletAdapter
} from '@solana/wallet-adapter-torus';
import {
    LedgerWalletAdapter
} from '@solana/wallet-adapter-ledger';
import {
    BraveWalletAdapter
} from '@solana/wallet-adapter-brave';
import {
    UnsafeBurnerWalletAdapter
} from '@solana/wallet-adapter-unsafe-burner';
import {
    WalletModalProvider
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

type Props = {
    children?: React.ReactNode;
};

export const Walletsc: FC<Props> = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new BackpackWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new BraveWalletAdapter(),
            new UnsafeBurnerWalletAdapter(), // useful for development
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
