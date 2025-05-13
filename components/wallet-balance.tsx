"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { RefreshCw } from "lucide-react"

interface TokenBalance {
  symbol: string
  balance: number
  usdValue: number
  icon: string
}

export default function WalletBalance() {
  const { publicKey } = useWallet()
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tokens, setTokens] = useState<TokenBalance[]>([])

  // Mock token data - in a real app, you would fetch this from a token program
  const mockTokens: TokenBalance[] = [
    {
      symbol: "USDC",
      balance: 125.45,
      usdValue: 125.45,
      icon: "U",
    },
    {
      symbol: "BONK",
      balance: 1250000,
      usdValue: 25.75,
      icon: "B",
    },
  ]

  useEffect(() => {
    if (!publicKey) {
      setSolBalance(null)
      setTokens([])
      return
    }

    const fetchBalances = async () => {
      setIsLoading(true)
      try {
        // Connect to Solana mainnet
        const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed")

        // Fetch SOL balance
        const balance = await connection.getBalance(publicKey)
        setSolBalance(balance / LAMPORTS_PER_SOL)

        // In a real app, you would fetch token balances here
        // For this demo, we'll use mock data
        setTokens(mockTokens)
      } catch (error) {
        console.error("Error fetching balances:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalances()
  }, [publicKey])

  if (!publicKey) {
    return null
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden mt-6">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-medium">Wallet Balance</h3>
        <button className="text-white/70 hover:text-white transition-colors" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-4">
        {/* SOL Balance */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 flex items-center justify-center">
              <span className="text-[10px] font-bold">S</span>
            </div>
            <span className="text-sm">SOL</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{solBalance !== null ? solBalance.toFixed(4) : "0.0000"}</div>
            <div className="text-xs text-white/50">
              ${solBalance !== null ? (solBalance * 178.33).toFixed(2) : "0.00"}
            </div>
          </div>
        </div>

        {/* Other Tokens */}
        {tokens.map((token, index) => (
          <div key={index} className="flex items-center justify-between mb-3 last:mb-0">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full ${token.symbol === "USDC" ? "bg-blue-500" : "bg-orange-500"} flex items-center justify-center`}
              >
                <span className="text-[10px] font-bold">{token.icon}</span>
              </div>
              <span className="text-sm">{token.symbol}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{token.balance.toLocaleString()}</div>
              <div className="text-xs text-white/50">${token.usdValue.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
