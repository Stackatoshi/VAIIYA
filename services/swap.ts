import { type Connection, Transaction } from "@solana/web3.js"
import { getJupiterQuote, getJupiterSwap } from "./jupiter"
import type { JupiterQuoteResponse } from "@/types/jupiter"

export async function executeSwap(
  connection: Connection,
  wallet: any, // This should be the wallet adapter
  fromMint: string,
  toMint: string,
  amount: string,
  slippageBps = 50,
): Promise<{ success: boolean; message: string; signature?: string }> {
  try {
    if (!wallet.publicKey) {
      return { success: false, message: "Wallet not connected" }
    }

    // 1. Get quote from Jupiter
    const quoteResponse = await getJupiterQuote(fromMint, toMint, amount, slippageBps)

    if (!quoteResponse) {
      return { success: false, message: "Failed to get quote" }
    }

    // 2. Get swap transaction
    const swapParams = {
      inputMint: fromMint,
      outputMint: toMint,
      amount,
      slippageBps,
      userPublicKey: wallet.publicKey.toString(),
    }

    const swapResponse = await getJupiterSwap(swapParams)

    if (!swapResponse) {
      return { success: false, message: "Failed to get swap transaction" }
    }

    // 3. Deserialize and sign the transaction
    const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, "base64")
    const transaction = Transaction.from(swapTransactionBuf)

    // 4. Execute the transaction
    const signature = await wallet.sendTransaction(transaction, connection)

    // 5. Wait for confirmation
    const latestBlockhash = await connection.getLatestBlockhash()
    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature,
    })

    return {
      success: true,
      message: "Swap executed successfully",
      signature,
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
): Promise<{ quote: JupiterQuoteResponse | null; error: string | null }> {
  try {
    const quote = await getJupiterQuote(fromMint, toMint, amount, slippageBps)
    return { quote, error: null }
  } catch (error) {
    return {
      quote: null,
      error: error instanceof Error ? error.message : "Failed to get quote",
    }
  }
}
