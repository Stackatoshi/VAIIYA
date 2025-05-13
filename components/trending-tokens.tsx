import { ExternalLink } from "lucide-react"

interface TrendingTokensProps {
  symbol: string
  price: string
  change: string
  subtitle: string
  isPositive?: boolean
}

export default function TrendingTokens({ symbol, price, change, subtitle, isPositive = false }: TrendingTokensProps) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full ${symbol === "USDC" ? "bg-blue-500" : "bg-gradient-to-r from-purple-500 to-teal-400"} flex items-center justify-center`}
          >
            <span className="text-[10px] font-bold">{symbol.charAt(0)}</span>
          </div>
          <div>
            <div className="text-sm font-medium">{symbol}</div>
            <div className="text-xs text-white/50">{subtitle}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{price}</div>
          <div className={`text-xs ${isPositive ? "text-green-400" : "text-white/50"}`}>{change}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-12 w-full mt-2">
        <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path
            d={
              isPositive
                ? "M0,20 Q10,18 20,15 T40,10 T60,8 T80,5 T100,2"
                : "M0,15 Q10,15 20,15 T40,15 T60,15 T80,15 T100,15"
            }
            fill="none"
            stroke={isPositive ? "#10b981" : "#3b82f6"}
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="flex justify-end mt-1">
        <button className="text-white/50 hover:text-white text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Open Page <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
