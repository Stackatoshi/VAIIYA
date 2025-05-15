export interface JupiterTokenInfo {
  address: string
  chainId: number
  decimals: number
  name: string
  symbol: string
  logoURI: string
  tags: string[]
  extensions?: {
    coingeckoId?: string
    [key: string]: any
  }
}

export interface TokenData extends JupiterTokenInfo {
  price?: number
  priceChange24h?: number
  volume24h?: number
  marketCap?: number
}

export interface TokenBalance {
  token: TokenData
  balance: number
  usdValue: number
}
