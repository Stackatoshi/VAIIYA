"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ChevronDown } from "lucide-react"
import { WalletButton } from "./wallet-button"

export default function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <header className="border-b border-white/10 backdrop-blur-md bg-black/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 flex items-center justify-center">
              <span className="font-bold text-white">V</span>
            </div>
            <span className="font-bold text-white">VAIIYA</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#" className="text-white hover:text-purple-400 transition-colors text-sm font-medium">
              Spot
            </Link>
            <Link href="#" className="text-white hover:text-purple-400 transition-colors text-sm font-medium relative">
              Pro
              <span className="absolute -top-1 -right-6 bg-gradient-to-r from-purple-500 to-teal-400 text-[10px] px-1.5 rounded-full">
                NEW
              </span>
            </Link>
            <Link href="#" className="text-white hover:text-purple-400 transition-colors text-sm font-medium">
              Perps
            </Link>
            <Link
              href="#"
              className="text-white hover:text-purple-400 transition-colors text-sm font-medium flex items-center"
            >
              More <ChevronDown className="w-4 h-4 ml-1" />
            </Link>
          </nav>

          {/* Search and Connect */}
          <div className="flex items-center gap-4">
            <div className={`relative ${isSearchFocused ? "w-64" : "w-48"} transition-all duration-300`}>
              <input
                type="text"
                placeholder="Search token or address"
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/50" />
            </div>

            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  )
}
