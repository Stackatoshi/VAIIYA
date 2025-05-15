"use client"

import { useEffect, useState } from "react"
import TokenIcon from "./token-icon"
import type { TokenData } from "@/types/token"

export default function PopularTokens() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch verified tokens with high market cap
        const response = await fetch("/api/tokens")
        if (!response.ok) {
          throw new Error(`Failed to fetch tokens: ${response.status}`)
        }
        const data = await response.json()

        // Get the top tokens (SOL, USDC, etc. should be at the top due to sorting)
        setTokens(data.slice(0, 5))
      } catch (error) {
        console.error("Error fetching tokens:", error)
        setError("Failed to load tokens")
        // Set some default tokens to prevent UI from breaking
        setTokens([
          {
            symbol: "SOL",
            name: "Solana",
            address: "So11111111111111111111111111111111111111112",
            logoURI: "",
            chainId: 101,
            decimals: 9,
            tags: ["verified"],
          },
          {
            symbol: "USDC",
            name: "USD Coin",
            address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            logoURI: "",
            chainId: 101,
            decimals: 6,
            tags: ["stablecoin", "verified"],
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-full px-3 py-1 h-7 w-20 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (error) {
    // Still render something even if there's an error
    return (
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        <div className="bg-white/5 rounded-full px-3 py-1 text-sm flex items-center gap-1">
          <TokenIcon symbol="SOL" size={16} />
          SOL
        </div>
        <div className="bg-white/5 rounded-full px-3 py-1 text-sm flex items-center gap-1">
          <TokenIcon symbol="USDC" size={16} />
          USDC
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
      {tokens.map((token) => (
        <div key={token.address} className="bg-white/5 rounded-full px-3 py-1 text-sm flex items-center gap-1">
          <TokenIcon symbol={token.symbol} logoURI={token.logoURI} size={16} />
          {token.symbol}
        </div>
      ))}
    </div>
  )
}
