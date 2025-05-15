export interface JupiterRouteInfo {
  inAmount: string
  outAmount: string
  amount: string
  otherAmountThreshold: string
  swapMode: string
  priceImpactPct: number
  marketInfos: {
    id: string
    label: string
    inputMint: string
    outputMint: string
    notEnoughLiquidity: boolean
    inAmount: string
    outAmount: string
    lpFee: {
      amount: string
      mint: string
      pct: number
    }
    platformFee: {
      amount: string
      mint: string
      pct: number
    }
  }[]
  slippageBps: number
}

export interface JupiterQuoteResponse {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  routes: JupiterRouteInfo[]
}

export interface JupiterSwapParams {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number
  swapMode?: string
  asLegacyTransaction?: boolean
  userPublicKey: string
}

export interface JupiterSwapResponse {
  swapTransaction: string
}
