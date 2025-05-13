import TokenSwap from "@/components/token-swap"
import Navbar from "@/components/navbar"
import TrendingTokens from "@/components/trending-tokens"
import WalletBalance from "@/components/wallet-balance"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f1b] via-[#0d1025] to-[#0f172a] text-white overflow-hidden relative">
      {/* Background gradient elements similar to Solana.com */}
      <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-600/20 to-teal-400/20 blur-3xl" />
      <div className="absolute -bottom-[300px] -left-[300px] w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-600/20 to-purple-400/20 blur-3xl" />

      <Navbar />

      <div className="container mx-auto px-4 pt-8 pb-20 relative z-10">
        <div className="max-w-xl mx-auto">
          {/* Popular tokens */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            <div className="bg-white/5 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span> VAIIYA
            </div>
            <div className="bg-white/5 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span> SOL
            </div>
            <div className="bg-white/5 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span> USDC
            </div>
            <div className="bg-white/5 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400"></span> BONK
            </div>
            <div className="bg-white/5 rounded-full px-3 py-1 text-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span> JUP
            </div>
          </div>

          {/* Swap tabs */}
          <div className="flex justify-center gap-2 mb-4">
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
              Instant
            </button>
            <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-full text-sm font-medium">
              Trigger
            </button>
            <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-full text-sm font-medium">
              Recurring
            </button>
          </div>

          {/* Swap card */}
          <TokenSwap />

          {/* Wallet Balance */}
          <WalletBalance />

          {/* Charts section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <TrendingTokens symbol="USDC" price="$1.00" change="+0%" subtitle="ERC-20v" />
            <TrendingTokens symbol="SOL" price="$178.33" change="+4.67%" subtitle="SOL-1112" isPositive={true} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 right-4 text-white/50 text-xs">
        <button className="hover:text-white transition-colors">Talk to us</button>
      </div>
    </main>
  )
}
