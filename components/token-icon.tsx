"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

interface TokenIconProps {
  symbol: string
  logoURI?: string
  size?: number
  className?: string
}

export default function TokenIcon({ symbol, logoURI, size = 24, className = "" }: TokenIconProps) {
  const [imageError, setImageError] = useState(false)

  const fallbackIcon = useMemo(() => {
    const colors: Record<string, string> = {
      SOL: "from-purple-500 to-teal-400",
      USDC: "bg-blue-500",
      BONK: "bg-orange-500",
      JUP: "from-blue-400 to-purple-500",
      default: "bg-gray-500",
    }

    return (
      <div
        className={`rounded-full flex items-center justify-center ${colors[symbol] || colors.default} ${
          colors[symbol]?.includes("from") ? "bg-gradient-to-r" : ""
        }`}
        style={{ width: size, height: size }}
      >
        <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
          {symbol.charAt(0)}
        </span>
      </div>
    )
  }, [symbol, size])

  // If no logoURI or there was an error loading the image, show the fallback
  if (!logoURI || imageError) {
    return fallbackIcon
  }

  // Otherwise, try to load the image
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
      <Image
        src={logoURI || "/placeholder.svg"}
        alt={symbol}
        width={size}
        height={size}
        className="object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  )
}
