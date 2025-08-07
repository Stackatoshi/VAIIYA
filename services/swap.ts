import { type Connection, Transaction, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getJupiterQuote, getJupiterSwap } from "./jupiter"
import type { JupiterQuoteResponse } from "@/types/jupiter"
import { calculateSwapFee, getFeeRecipient, FEE_CONFIG } from "./fee"

export async function executeSwap(
  connection: Connection,
  wallet: any, // This should be the wallet adapter
  fromMint: string,
  toMint: string,
  amount: string,
  slippageBps = 50,
  tokenDecimals = 9,
  tokenPrice = 1,
): Promise<{ success: boolean; message: string; signature?: string }> {
  try {
    if (!wallet.publicKey) {
      return { success: false, message: "Wallet not connected" }
    }

    // 1. Calculate fee
    const feeCalculation = calculateSwapFee(amount, tokenDecimals, tokenPrice)
    console.log("Fee calculation:", {
      originalAmount: feeCalculation.originalAmount,
      feeAmount: feeCalculation.feeAmount,
      netAmount: feeCalculation.netAmount,
      feePercentage: FEE_CONFIG.FEE_PERCENTAGE * 100,
    })

    // 2. Get quote from Jupiter with net amount (after fee)
    const quoteResponse = await getJupiterQuote(fromMint, toMint, feeCalculation.netAmount, slippageBps)

    if (!quoteResponse) {
      return { success: false, message: "Failed to get quote" }
    }

    // 3. Get swap transaction
    const swapParams = {
      inputMint: fromMint,
      outputMint: toMint,
      amount: feeCalculation.netAmount, // Use net amount for swap
      slippageBps,
      userPublicKey: wallet.publicKey.toString(),
    }

    const swapResponse = await getJupiterSwap(swapParams)

    if (!swapResponse) {
      return { success: false, message: "Failed to get swap transaction" }
    }

    // 4. Deserialize the swap transaction
    const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, "base64")
    const swapTransaction = Transaction.from(swapTransactionBuf)

    // 5. Create fee transfer transaction
    const feeRecipient = getFeeRecipient()
    const feeTransferTransaction = new Transaction()
    
    // Add fee transfer instruction
    const feeTransferInstruction = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: feeRecipient,
      lamports: Math.floor(feeCalculation.feeInSol * LAMPORTS_PER_SOL),
    })
    
    feeTransferTransaction.add(feeTransferInstruction)

    // 6. Combine transactions or execute separately
    // For now, we'll execute the swap first, then the fee transfer
    const swapSignature = await wallet.sendTransaction(swapTransaction, connection)
    
    // Wait for swap confirmation
    const latestBlockhash = await connection.getLatestBlockhash()
    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: swapSignature,
    })

    // Execute fee transfer
    const feeSignature = await wallet.sendTransaction(feeTransferTransaction, connection)
    
    // Wait for fee transfer confirmation
    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: feeSignature,
    })

    return {
      success: true,
      message: `Swap executed successfully. Fee: ${(FEE_CONFIG.FEE_PERCENTAGE * 100).toFixed(2)}%`,
      signature: swapSignature,
    }
  } catch (error) {
    console.error("Error executing swap:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getSwapQuote(
  fromMint: string,
  toMint: string,
  amount: string,
  slippageBps = 50,
  tokenDecimals = 9,
  tokenPrice = 1,
): Promise<{ quote: JupiterQuoteResponse | null; error: string | null; feeCalculation?: any }> {
  try {
    // Calculate fee first
    const feeCalculation = calculateSwapFee(amount, tokenDecimals, tokenPrice)
    
    // Get quote with net amount (after fee)
    const quote = await getJupiterQuote(fromMint, toMint, feeCalculation.netAmount, slippageBps)
    
    return { 
      quote, 
      error: null,
      feeCalculation: {
        ...feeCalculation,
        feePercentage: FEE_CONFIG.FEE_PERCENTAGE * 100,
        feeInUSD: feeCalculation.feeInSol,
      }
    }
  } catch (error) {
    return {
      quote: null,
      error: error instanceof Error ? error.message : "Failed to get quote",
    }
  }
}
