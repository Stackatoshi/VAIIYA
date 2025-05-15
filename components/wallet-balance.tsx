"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { RefreshCw } from "lucide-react"
import TokenIcon from "./token-icon"
import type { TokenData, TokenBalance } from "@/types/token"

export default function WalletBalance() {
  const { publicKey } = useWallet()
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tokens, setTokens] = useState<TokenBalance[]>([])
  const [solPrice, setSolPrice] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!publicKey) {
      setSolBalance(null)
      setTokens([])
      return
    }

    const fetchBalances = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Connect to Solana devnet for testing
        const connection = new Connection("https://api.devnet.solana.com", "confirmed")

        // Fetch SOL balance
        const balance = await connection.getBalance(publicKey)
        setSolBalance(balance / LAMPORTS_PER_SOL)

        // Fetch token list
        const response = await fetch("/api/tokens")
        if (!response.ok) {
          throw new Error(`Failed to fetch tokens: ${response.status}`)
        }
        const tokenList = await response.json()

        // Get SOL price
        const solToken = tokenList.find((t: TokenData) => t.symbol === "SOL")
        if (solToken && solToken.price) {
          setSolPrice(solToken.price)
        }

        // In a real app, you would fetch token balances here
        // For this demo, we'll use mock data for a few popular tokens
        const mockBalances: TokenBalance[] = [
          {
            token: tokenList.find((t: TokenData) => t.symbol === "USDC") || tokenList[0],
            balance: 125.45,
            usdValue: 125.45,
          },
          {
            token: tokenList.find((t: TokenData) => t.symbol === "BONK") || tokenList[1],
            balance: 1250000,
            usdValue: 25.75,
          },
        ].filter((t): t is TokenBalance => !!t.token)

        setTokens(mockBalances)
      } catch (error) {
        console.error("Error fetching balances:", error)
        setError("Failed to load balances")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalances()
  }, [publicKey])

  const handleRefresh = async () => {
    if (!publicKey || isLoading) return
    await fetchBalances()
  }

  const fetchBalances = async () => {
    if (!publicKey) return

    setIsLoading(true)
    setError(null)
    try {
      // Connect to Solana devnet for testing
      const connection = new Connection("https://api.devnet.solana.com", "confirmed")

      // Fetch SOL balance
      const balance = await connection.getBalance(publicKey)
      setSolBalance(balance / LAMPORTS_PER_SOL)

      // In a real app, you would fetch token balances here
      // For this demo, we'll keep the existing mock data
    } catch (error) {
      console.error("Error refreshing balances:", error)
      setError("Failed to refresh balances")
    } finally {
      setIsLoading(false)
    }
  }

  if (!publicKey) {
    return null
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden mt-6">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-medium">Wallet Balance</h3>
        <button
          className="text-white/70 hover:text-white transition-colors"
          disabled={isLoading}
          onClick={handleRefresh}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error ? (
        <div className="p-4 text-center text-red-400 text-sm">{error}</div>
      ) : (
        <div className="p-4">
          {/* SOL Balance */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TokenIcon symbol="SOL" size={24} />
              <span className="text-sm">SOL</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{solBalance !== null ? solBalance.toFixed(4) : "0.0000"}</div>
              <div className="text-xs text-white/50">
                ${solBalance !== null ? (solBalance * solPrice).toFixed(2) : "0.00"}
              </div>
            </div>
          </div>

          {/* Other Tokens */}
          {tokens.map((token, index) => (
            <div key={index} className="flex items-center justify-between mb-3 last:mb-0">
              <div className="flex items-center gap-2">
                <TokenIcon symbol={token.token.symbol} logoURI={token.token.logoURI} size={24} />
                <span className="text-sm">{token.token.symbol}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {token.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: token.token.symbol === "USDC" ? 2 : 0,
                  })}
                </div>
                <div className="text-xs text-white/50">${token.usdValue.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
