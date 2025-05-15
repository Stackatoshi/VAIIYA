import type { JupiterQuoteResponse, JupiterSwapParams, JupiterSwapResponse } from "@/types/jupiter"

const JUPITER_API_BASE = "https://quote-api.jup.ag/v6"

export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: string,
  slippageBps = 50, // 0.5% default slippage
): Promise<JupiterQuoteResponse | null> {
  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps: slippageBps.toString(),
    })

    const response = await fetch(`${JUPITER_API_BASE}/quote?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Failed to get quote: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching Jupiter quote:", error)
    return null
  }
}

export async function getJupiterSwap(params: JupiterSwapParams): Promise<JupiterSwapResponse | null> {
  try {
    const response = await fetch(`${JUPITER_API_BASE}/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params,
        asLegacyTransaction: params.asLegacyTransaction ?? true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get swap transaction: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching Jupiter swap transaction:", error)
    return null
  }
}
