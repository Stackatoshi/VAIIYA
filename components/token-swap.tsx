"use client"

import { useState } from "react"
import { ChevronDown, ArrowUpDown, Settings } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"

export default function TokenSwap() {
  const { publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [settings, setSettings] = useState({
    slippage: "0.5",
  })

  const handleConnectWallet = () => {
    setVisible(true)
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
      {/* Swap header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Ultra V2</span>
          <div className="bg-white/10 rounded px-1 py-0.5">
            <Settings className="w-3 h-3 text-white/70" />
          </div>
        </div>
        <button className="text-white/70 hover:text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 15H21M21 15H21C21 16.8565 20.2625 18.637 18.9497 19.9497C17.637 21.2625 15.8565 22 14 22H10C8.14348 22 6.36301 21.2625 5.05025 19.9497C3.7375 18.637 3 16.8565 3 15V9C3 7.14348 3.7375 5.36301 5.05025 4.05025C6.36301 2.7375 8.14348 2 10 2H14C15.8565 2 17.637 2.7375 18.9497 4.05025C20.2625 5.36301 21 7.14348 21 9V15ZM15 15L12 12M15 15L12 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Selling token */}
      <div className="p-4 border-b border-white/10">
        <div className="text-sm text-white/70 mb-2">Selling</div>
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors rounded-full py-1.5 px-3">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-[10px] font-bold">U</span>
            </div>
            <span className="text-sm font-medium">USDC</span>
            <ChevronDown className="w-4 h-4 text-white/70" />
          </button>

          <div className="text-right">
            <input
              type="text"
              placeholder="0.00"
              className="bg-transparent text-2xl text-right w-full max-w-[150px] focus:outline-none"
            />
            <div className="text-xs text-white/50">$0</div>
          </div>
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center -mt-3 -mb-3 relative z-10">
        <button className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/15 transition-colors">
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>

      {/* Buying token */}
      <div className="p-4 border-t border-white/10">
        <div className="text-sm text-white/70 mb-2">Buying</div>
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors rounded-full py-1.5 px-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 flex items-center justify-center">
              <span className="text-[10px] font-bold">S</span>
            </div>
            <span className="text-sm font-medium">SOL</span>
            <ChevronDown className="w-4 h-4 text-white/70" />
          </button>

          <div className="text-right">
            <input
              type="text"
              placeholder="0.00"
              className="bg-transparent text-2xl text-right w-full max-w-[150px] focus:outline-none"
              readOnly
            />
            <div className="text-xs text-white/50">$0</div>
          </div>
        </div>
      </div>

      {/* Route info */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Route</span>
          <span className="text-white">USDC → SOL</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-white/70">Price impact</span>
          <span className="text-white">0.00%</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-white/70">Minimum received</span>
          <span className="text-white">0 SOL</span>
        </div>
      </div>

      {/* Connect button */}
      <div className="p-4">
        {publicKey ? (
          <button className="w-full bg-gradient-to-r from-purple-500 to-teal-400 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
            Swap
          </button>
        ) : (
          <button
            onClick={handleConnectWallet}
            className="w-full bg-gradient-to-r from-purple-500 to-teal-400 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Chart toggles */}
      <div className="flex items-center justify-center gap-6 p-4 border-t border-white/10">
        <button className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 13.2L8.5 19L21 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Show Chart
        </button>
        <button className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 13.2L8.5 19L21 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Show History
        </button>
      </div>
    </div>
  )
}
