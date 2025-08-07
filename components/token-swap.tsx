"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { ChevronDown, ArrowUpDown, Settings, AlertCircle } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import TokenIcon from "./token-icon"
import TokenSelectModal from "./token-select-modal"
import type { TokenData } from "@/types/token"
import { getSwapQuote, executeSwap } from "@/services/swap"
import type { JupiterQuoteResponse } from "@/types/jupiter"
import { FEE_CONFIG } from "@/services/fee"

export default function TokenSwap() {
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { setVisible } = useWalletModal()
  const [settings, setSettings] = useState({
    slippage: 0.5,
  })
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false)
  const [selectingTokenSide, setSelectingTokenSide] = useState<"sell" | "buy">("sell")
  const [sellToken, setSellToken] = useState<TokenData | null>(null)
  const [buyToken, setBuyToken] = useState<TokenData | null>(null)
  const [sellAmount, setSellAmount] = useState("")
  const [buyAmount, setBuyAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSwapLoading, setIsSwapLoading] = useState(false)
  const [swapQuote, setSwapQuote] = useState<JupiterQuoteResponse | null>(null)
  const [swapError, setSwapError] = useState<string | null>(null)

  // Fetch default tokens on mount
  useEffect(() => {
    const fetchDefaultTokens = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/tokens")
        if (!response.ok) {
          throw new Error(`Failed to fetch tokens: ${response.status}`)
        }
        const tokens = await response.json()

        // Set USDC as default sell token
        const defaultSellToken = tokens.find((t: TokenData) => t.symbol === "USDC")
        if (defaultSellToken) setSellToken(defaultSellToken)

        // Set SOL as default buy token
        const defaultBuyToken = tokens.find((t: TokenData) => t.symbol === "SOL")
        if (defaultBuyToken) setBuyToken(defaultBuyToken)
      } catch (error) {
        console.error("Error fetching default tokens:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDefaultTokens()
  }, [])

  // Get quote when tokens or amount changes
  useEffect(() => {
    const getQuote = async () => {
      if (!sellToken || !buyToken || !sellAmount || Number(sellAmount) <= 0) {
        setBuyAmount("")
        setSwapQuote(null)
        return
      }

      setIsSwapLoading(true)
      setSwapError(null)

      try {
        // Convert to lamports/smallest unit
        const decimals = sellToken.decimals
        const amountInSmallestUnit = (Number(sellAmount) * 10 ** decimals).toString()

        const { quote, error, feeCalculation } = await getSwapQuote(
          sellToken.address,
          buyToken.address,
          amountInSmallestUnit,
          Math.round(settings.slippage * 100), // Convert to basis points
          sellToken.decimals,
          sellToken.price || 1,
        )

        if (error) {
          setSwapError(error)
          setBuyAmount("")
        } else if (quote) {
          setSwapQuote(quote)
          // Convert from smallest unit to display amount
          const outAmount = Number(quote.outAmount) / 10 ** buyToken.decimals
          setBuyAmount(outAmount.toFixed(6))
        }
      } catch (error) {
        console.error("Error getting quote:", error)
        setSwapError("Failed to get quote")
        setBuyAmount("")
      } finally {
        setIsSwapLoading(false)
      }
    }

    getQuote()
  }, [sellToken, buyToken, sellAmount, settings.slippage])

  const handleConnectWallet = useCallback(() => {
    try {
      setConnectionError(null)
      setVisible(true)
    } catch (error) {
      console.error("Wallet connection error:", error)
      setConnectionError("Failed to open wallet connection modal")
    }
  }, [setVisible])

  const openTokenSelect = (side: "sell" | "buy") => {
    setSelectingTokenSide(side)
    setIsTokenSelectOpen(true)
  }

  const handleTokenSelect = (token: TokenData) => {
    if (selectingTokenSide === "sell") {
      setSellToken(token)
      // If selected token is the same as buy token, swap them
      if (buyToken && token.address === buyToken.address) {
        setBuyToken(sellToken)
      }
    } else {
      setBuyToken(token)
      // If selected token is the same as sell token, swap them
      if (sellToken && token.address === sellToken.address) {
        setSellToken(buyToken)
      }
    }
  }

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and decimals
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === "") {
      setSellAmount(value)
    }
  }

  const swapTokens = () => {
    const temp = sellToken
    setSellToken(buyToken)
    setBuyToken(temp)

    const tempAmount = sellAmount
    setSellAmount(buyAmount)
    setBuyAmount(tempAmount)
  }

  const handleSwap = async () => {
    if (!publicKey || !sellToken || !buyToken || !sellAmount || Number(sellAmount) <= 0) {
      return
    }

    setIsSwapLoading(true)
    setSwapError(null)

    try {
      // Convert to lamports/smallest unit
      const decimals = sellToken.decimals
      const amountInSmallestUnit = (Number(sellAmount) * 10 ** decimals).toString()

      const result = await executeSwap(
        connection,
        { publicKey, signTransaction, sendTransaction },
        sellToken.address,
        buyToken.address,
        amountInSmallestUnit,
        Math.round(settings.slippage * 100), // Convert to basis points
        sellToken.decimals,
        sellToken.price || 1,
      )

      if (!result.success) {
        setSwapError(result.message)
      } else {
        // Clear form after successful swap
        setSellAmount("")
        setBuyAmount("")
        // You could add a success notification here
      }
    } catch (error) {
      console.error("Swap error:", error)
      setSwapError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsSwapLoading(false)
    }
  }

  // Calculate USD values
  const sellValueUSD = sellToken && sellAmount && sellToken.price ? Number(sellAmount) * sellToken.price : 0
  const buyValueUSD = buyToken && buyAmount && buyToken.price ? Number(buyAmount) * buyToken.price : 0

  // Calculate price impact
  const priceImpact = swapQuote?.routes[0]?.priceImpactPct ?? 0

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
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Slippage: {settings.slippage}%</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Selling token */}
          <div className="p-4 border-b border-white/10">
            <div className="text-sm text-white/70 mb-2">Selling</div>
            <div className="flex items-center justify-between">
              <button
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors rounded-full py-1.5 px-3"
                onClick={() => openTokenSelect("sell")}
              >
                {sellToken ? (
                  <>
                    <TokenIcon symbol={sellToken.symbol} logoURI={sellToken.logoURI} size={20} />
                    <span className="text-sm font-medium">{sellToken.symbol}</span>
                  </>
                ) : (
                  <span className="text-sm font-medium">Select token</span>
                )}
                <ChevronDown className="w-4 h-4 text-white/70" />
              </button>

              <div className="text-right">
                <input
                  type="text"
                  placeholder="0.00"
                  value={sellAmount}
                  onChange={handleSellAmountChange}
                  className="bg-transparent text-2xl text-right w-full max-w-[150px] focus:outline-none"
                  disabled={isSwapLoading}
                />
                <div className="text-xs text-white/50">
                  ${sellValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center -mt-3 -mb-3 relative z-10">
            <button
              className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/15 transition-colors"
              onClick={swapTokens}
              disabled={isSwapLoading}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Buying token */}
          <div className="p-4 border-t border-white/10">
            <div className="text-sm text-white/70 mb-2">Buying</div>
            <div className="flex items-center justify-between">
              <button
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors rounded-full py-1.5 px-3"
                onClick={() => openTokenSelect("buy")}
                disabled={isSwapLoading}
              >
                {buyToken ? (
                  <>
                    <TokenIcon symbol={buyToken.symbol} logoURI={buyToken.logoURI} size={20} />
                    <span className="text-sm font-medium">{buyToken.symbol}</span>
                  </>
                ) : (
                  <span className="text-sm font-medium">Select token</span>
                )}
                <ChevronDown className="w-4 h-4 text-white/70" />
              </button>

              <div className="text-right">
                <div className="text-2xl">
                  {isSwapLoading ? (
                    <div className="h-8 w-20 bg-white/5 rounded animate-pulse"></div>
                  ) : (
                    buyAmount || "0.00"
                  )}
                </div>
                <div className="text-xs text-white/50">
                  ${buyValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Route info */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Route</span>
              <span className="text-white">
                {sellToken && buyToken ? `${sellToken.symbol} → ${buyToken.symbol}` : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-white/70">Price impact</span>
              <span
                className={`text-white ${priceImpact > 1 ? "text-yellow-400" : ""} ${priceImpact > 3 ? "text-red-400" : ""}`}
              >
                {priceImpact > 0 ? `${priceImpact.toFixed(2)}%` : "0.00%"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-white/70">Platform fee</span>
              <span className="text-white text-green-400">
                {FEE_CONFIG.FEE_PERCENTAGE * 100}% (vs 0.85% on Phantom)
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-white/70">Minimum received</span>
              <span className="text-white">
                {buyAmount && buyToken
                  ? `${(Number(buyAmount) * (1 - settings.slippage / 100)).toFixed(6)} ${buyToken.symbol}`
                  : "-"}
              </span>
            </div>
          </div>

          {/* Error message */}
          {swapError && (
            <div className="p-3 mx-4 mb-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-400">{swapError}</div>
            </div>
          )}

          {/* Connect/Swap button */}
          <div className="p-4">
            {publicKey ? (
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-teal-400 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!sellToken || !buyToken || !sellAmount || Number(sellAmount) <= 0 || isSwapLoading}
                onClick={handleSwap}
              >
                {isSwapLoading ? "Swapping..." : "Swap"}
              </button>
            ) : (
              <div>
                <button
                  onClick={handleConnectWallet}
                  className="w-full bg-gradient-to-r from-purple-500 to-teal-400 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Connect Wallet
                </button>
                {connectionError && <div className="text-red-400 text-xs mt-2 text-center">{connectionError}</div>}
              </div>
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
        </>
      )}

      {/* Token Select Modal */}
      <TokenSelectModal
        isOpen={isTokenSelectOpen}
        onClose={() => setIsTokenSelectOpen(false)}
        onSelect={handleTokenSelect}
        excludeSymbol={selectingTokenSide === "sell" ? buyToken?.symbol : sellToken?.symbol}
        title={`Select ${selectingTokenSide === "sell" ? "selling" : "buying"} token`}
      />
    </div>
  )
}
