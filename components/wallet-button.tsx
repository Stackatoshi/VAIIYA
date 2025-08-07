"use client"

import { type FC, useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { ChevronDown, Copy, LogOut } from "lucide-react"

export const WalletButton: FC = () => {
  const { publicKey, wallet, disconnect, connecting, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = useCallback(async () => {
    try {
      setError(null)
      setVisible(true)
      
      // Add a small delay to ensure the modal is properly opened
      setTimeout(() => {
        console.log("Wallet modal opened")
      }, 100)
    } catch (err) {
      console.error("Wallet connection error:", err)
      setError("Failed to open wallet connection modal")
    }
  }, [setVisible])

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect()
      setShowDropdown(false)
    } catch (err) {
      console.error("Wallet disconnect error:", err)
    }
  }, [disconnect])

  const copyAddress = useCallback(() => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
      // You could add a toast notification here
    }
    setShowDropdown(false)
  }, [publicKey])

  // Format the wallet address to show only the first and last few characters
  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (!publicKey) {
    return (
      <div>
        <button
          onClick={handleConnect}
          className="bg-gradient-to-r from-purple-500 to-teal-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {connecting ? "Connecting..." : "Connect"}
        </button>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        {/* Debug info - remove in production */}
        <div className="text-xs text-white/50 mt-1">
          Status: {connected ? "Connected" : "Disconnected"} | Connecting: {connecting ? "Yes" : "No"}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/15 transition-colors flex items-center gap-2"
      >
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-teal-400" />
        {formatWalletAddress(publicKey.toString())}
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-[#0f1025] border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-2 border-b border-white/10 text-xs text-white/50">{wallet?.adapter.name || "Wallet"}</div>
          <button
            onClick={copyAddress}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-white/5 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Address
          </button>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-white/5 transition-colors text-red-400"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
