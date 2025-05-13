import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SolanaProvider } from "@/components/solana-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VAIIYA | Fast Token Exchange",
  description: "Swap tokens instantly with the best rates on Solana",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  )
}
