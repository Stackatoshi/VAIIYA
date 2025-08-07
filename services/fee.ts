import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

// Fee configuration
export const FEE_CONFIG = {
  FEE_PERCENTAGE: 0.001, // 0.1%
  FEE_RECIPIENT: "EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3", // Solana Dev wallet
  MAX_FEE_PERCENTAGE: 0.001, // Maximum 0.1% fee
} as const

export interface FeeCalculation {
  originalAmount: string
  feeAmount: string
  netAmount: string
  feeInSol: number
}

/**
 * Calculate the fee for a swap transaction
 * @param amount - The original swap amount in smallest units
 * @param decimals - The number of decimals for the token
 * @param tokenPrice - The price of the token in USD
 * @returns Fee calculation details
 */
export function calculateSwapFee(
  amount: string,
  decimals: number,
  tokenPrice: number = 1
): FeeCalculation {
  const originalAmount = BigInt(amount)
  const feeAmount = (originalAmount * BigInt(Math.floor(FEE_CONFIG.FEE_PERCENTAGE * 1000))) / BigInt(1000)
  const netAmount = originalAmount - feeAmount

  // Convert fee to SOL equivalent for display
  const feeInSmallestUnit = Number(feeAmount)
  const feeInTokenUnits = feeInSmallestUnit / Math.pow(10, decimals)
  const feeInSol = feeInTokenUnits * tokenPrice

  return {
    originalAmount: amount,
    feeAmount: feeAmount.toString(),
    netAmount: netAmount.toString(),
    feeInSol,
  }
}

/**
 * Get the fee recipient public key
 */
export function getFeeRecipient(): PublicKey {
  return new PublicKey(FEE_CONFIG.FEE_RECIPIENT)
}

/**
 * Format fee display for UI
 */
export function formatFeeDisplay(feeInSol: number): string {
  return `${(feeInSol * 100).toFixed(2)}%`
}

/**
 * Calculate fee in USD
 */
export function calculateFeeUSD(amount: string, decimals: number, tokenPrice: number): number {
  const feeCalculation = calculateSwapFee(amount, decimals, tokenPrice)
  return feeCalculation.feeInSol
} 