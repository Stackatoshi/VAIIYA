"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import TokenList from "./token-list"
import type { TokenData } from "@/types/token"

interface TokenSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (token: TokenData) => void
  excludeSymbol?: string
  title?: string
}

export default function TokenSelectModal({
  isOpen,
  onClose,
  onSelect,
  excludeSymbol,
  title = "Select a token",
}: TokenSelectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleTokenSelect = (token: TokenData) => {
    onSelect(token)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-[#0f1025] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-medium">{title}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <TokenList onSelect={handleTokenSelect} excludeSymbol={excludeSymbol} />
        </div>
      </div>
    </div>
  )
}
