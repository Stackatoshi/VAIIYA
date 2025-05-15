"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import TokenIcon from "./token-icon"
import type { TokenData } from "@/types/token"

interface TokenListProps {
  onSelect: (token: TokenData) => void
  excludeSymbol?: string
}

export default function TokenList({ onSelect, excludeSymbol }: TokenListProps) {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [filteredTokens, setFilteredTokens] = useState<TokenData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTag, setActiveTag] = useState("")

  // Get available tags from the tokens
  const tags = [
    { id: "", name: "All" },
    { id: "verified", name: "Verified" },
    { id: "stablecoin", name: "Stablecoins" },
    { id: "wrapped-solana", name: "Wrapped SOL" },
    { id: "meme", name: "Meme" },
  ]

  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/tokens")
        if (!response.ok) {
          throw new Error(`Failed to fetch tokens: ${response.status}`)
        }
        const data = await response.json()
        setTokens(data)
        setFilteredTokens(data)
      } catch (error) {
        console.error("Error fetching tokens:", error)
        setError("Failed to load tokens. Please try again.")
        // Set some default tokens to prevent UI from breaking
        const defaultTokens = [
          {
            symbol: "SOL",
            name: "Solana",
            address: "So11111111111111111111111111111111111111112",
            logoURI: "",
            chainId: 101,
            decimals: 9,
            tags: ["verified"],
            price: 178.33,
            priceChange24h: 4.67,
          },
          {
            symbol: "USDC",
            name: "USD Coin",
            address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            logoURI: "",
            chainId: 101,
            decimals: 6,
            tags: ["stablecoin", "verified"],
            price: 1.0,
            priceChange24h: 0.01,
          },
        ]
        setTokens(defaultTokens)
        setFilteredTokens(defaultTokens)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [])

  useEffect(() => {
    // Filter tokens based on search query and active tag
    let filtered = tokens

    if (excludeSymbol) {
      filtered = filtered.filter((token) => token.symbol !== excludeSymbol)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (token) =>
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.address.toLowerCase() === searchQuery.toLowerCase(),
      )
    }

    if (activeTag) {
      filtered = filtered.filter((token) => token.tags && token.tags.some((tag) => tag === activeTag))
    }

    setFilteredTokens(filtered)
  }, [tokens, searchQuery, activeTag, excludeSymbol])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const handleTagClick = (tagId: string) => {
    setActiveTag(tagId)
  }

  return (
    <div className="w-full">
      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search tokens by name or address"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-10 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/50" />
        {searchQuery && (
          <button onClick={clearSearch} className="absolute right-3 top-2.5 text-white/50 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag.id)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
              activeTag === tag.id
                ? "bg-gradient-to-r from-purple-500 to-teal-400 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {/* Token List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">{error}</div>
      ) : filteredTokens.length === 0 ? (
        <div className="text-center py-8 text-white/50">No tokens found matching your search</div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
          {filteredTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => onSelect(token)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TokenIcon symbol={token.symbol} logoURI={token.logoURI} size={32} />
                <div className="text-left">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-xs text-white/50">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  $
                  {token.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) ||
                    "—"}
                </div>
                {token.priceChange24h !== undefined && (
                  <div className={`text-xs ${token.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {token.priceChange24h >= 0 ? "+" : ""}
                    {token.priceChange24h.toFixed(2)}%
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
