// lib/context/ClientWalletProvider.tsx
'use client'; // This component must be a client component

import React, { useMemo, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import specific wallet adapters you want to support
import {
    // LedgerWalletAdapter, // Example
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    // TorusWalletAdapter, // Example
    // Add others as needed
} from '@solana/wallet-adapter-wallets';

// Default styles for the modal
import '@solana/wallet-adapter-react-ui/styles.css';

type ClientWalletProviderProps = {
    children: ReactNode;
};

export const ClientWalletProvider: React.FC<ClientWalletProviderProps> = ({ children }) => {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta' or a custom RPC URL
    // *** IMPORTANT: Match this to your backend's expected network (from .env) ***
    // For local testing: use the local RPC URL
    // const network = WalletAdapterNetwork.Devnet; // Or Testnet, Mainnet
    // const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // *** FOR LOCAL TESTING ***
    // Use your local node URL. Ensure it's accessible from the browser.
    // If running frontend/backend locally, this should work.
    // If using Docker/WSL, ensure ports are mapped/accessible.
    const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "http://127.0.0.1:8899"; // Get from env or default

     console.log("Wallet Adapter Endpoint:", endpoint); // Debugging endpoint


    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            // Add other adapters like new LedgerWalletAdapter(), etc.
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [endpoint] // Re-initialize adapters if endpoint changes (though it usually won't)
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children} {/* Your app components */}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};