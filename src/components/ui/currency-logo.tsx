"use client"

import Image from "next/image"

interface CurrencyLogoProps {
  currency: "SOL" | "USDC"
  size?: number
  className?: string
}

export function CurrencyLogo({ currency, size = 24, className }: CurrencyLogoProps) {
  return (
    <div className={className}>
      <Image
        src={currency === "SOL" ? "/solana-logo.svg" : "/usdc-logo.svg"}
        alt={currency === "SOL" ? "Solana" : "USDC"}
        width={size}
        height={size}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
    </div>
  )
} 