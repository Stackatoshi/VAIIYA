"use client"

import { type FC, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { ChevronDown, Copy, LogOut } from "lucide-react"

export const WalletButton: FC = () => {
  const { publicKey, wallet, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleConnect = () => {
    setVisible(true)
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDropdown(false)
  }

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
      // You could add a toast notification here
    }
    setShowDropdown(false)
  }

  // Format the wallet address to show only the first and last few characters
  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (!publicKey) {
    return (
      <button
        onClick={handleConnect}
        className="bg-gradient-to-r from-purple-500 to-teal-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Connect
      </button>
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
