import { NextResponse } from "next/server"
import type { JupiterTokenInfo, TokenData } from "@/types/token"

// Cache the token data to avoid excessive API calls
let tokenCache: TokenData[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")?.toLowerCase() || ""
  const tag = searchParams.get("tag")?.toLowerCase() || ""

  try {
    // Check if we need to fetch fresh data
    const now = Date.now()
    if (!tokenCache || now - lastFetchTime > CACHE_DURATION) {
      // Fetch token list from Jupiter API
      const response = await fetch("https://token.jup.ag/all", {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // Revalidate every hour
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch tokens from Jupiter: ${response.status}`)
      }

      const jupiterTokens: JupiterTokenInfo[] = await response.json()

      // Convert to our token format
      tokenCache = jupiterTokens.map((token) => ({
        ...token,
        // Add mock price data for demo purposes
        // In a real app, you would fetch this from a price API
        price:
          token.symbol === "SOL"
            ? 178.33
            : token.symbol === "USDC"
              ? 1.0
              : token.symbol === "BONK"
                ? 0.00002045
                : token.symbol === "JUP"
                  ? 1.87
                  : Math.random() * 10,
        priceChange24h:
          token.symbol === "SOL"
            ? 4.67
            : token.symbol === "USDC"
              ? 0.01
              : token.symbol === "BONK"
                ? -2.34
                : token.symbol === "JUP"
                  ? 3.21
                  : Math.random() * 10 - 5,
        volume24h: Math.floor(Math.random() * 100000000),
        marketCap: Math.floor(Math.random() * 1000000000),
      }))

      lastFetchTime = now
    }

    let filteredTokens = [...tokenCache]

    // Filter by search query
    if (query) {
      filteredTokens = filteredTokens.filter(
        (token) =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.address.toLowerCase() === query,
      )
    }

    // Filter by tag
    if (tag) {
      filteredTokens = filteredTokens.filter((token) => token.tags && token.tags.some((t) => t.toLowerCase() === tag))
    }

    // Sort tokens: verified first, then by market cap
    filteredTokens.sort((a, b) => {
      // First sort by verification status
      const aVerified = a.tags && a.tags.includes("verified")
      const bVerified = b.tags && b.tags.includes("verified")

      if (aVerified && !bVerified) return -1
      if (!aVerified && bVerified) return 1

      // Then sort by market cap (if available)
      if (a.marketCap && b.marketCap) {
        return b.marketCap - a.marketCap
      }

      // Finally sort by symbol
      return a.symbol.localeCompare(b.symbol)
    })

    // Limit to first 100 tokens for performance
    return NextResponse.json(filteredTokens.slice(0, 100))
  } catch (error) {
    console.error("Error fetching tokens:", error)
    // Return a fallback list of tokens to prevent UI from breaking
    const fallbackTokens: TokenData[] = [
      {
        address: "So11111111111111111111111111111111111111112",
        chainId: 101,
        decimals: 9,
        name: "Wrapped SOL",
        symbol: "SOL",
        logoURI:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
        tags: ["wrapped-solana", "verified"],
        price: 178.33,
        priceChange24h: 4.67,
        volume24h: 1245000000,
        marketCap: 78900000000,
      },
      {
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        chainId: 101,
        decimals: 6,
        name: "USD Coin",
        symbol: "USDC",
        logoURI:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        tags: ["stablecoin", "verified"],
        price: 1.0,
        priceChange24h: 0.01,
        volume24h: 987000000,
        marketCap: 34500000000,
      },
      {
        address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        chainId: 101,
        decimals: 5,
        name: "Bonk",
        symbol: "BONK",
        logoURI:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
        tags: ["meme"],
        price: 0.00002045,
        priceChange24h: -2.34,
        volume24h: 56000000,
        marketCap: 1200000000,
      },
    ]
    return NextResponse.json(fallbackTokens)
  }
}
