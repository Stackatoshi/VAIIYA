"use client"

import { type FC, type ReactNode, useMemo } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"

// Import the styles
import "@solana/wallet-adapter-react-ui/styles.css"

interface SolanaProviderProps {
  children: ReactNode
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  // Use devnet for testing to avoid mainnet connection issues
  const network = WalletAdapterNetwork.Devnet

  // Use a more reliable RPC endpoint
  // For a real app, you might want to use a custom RPC endpoint
  const endpoint = useMemo(() => {
    // Use clusterApiUrl as fallback
    return clusterApiUrl(network)
  }, [network])

  // Configure wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network],
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
