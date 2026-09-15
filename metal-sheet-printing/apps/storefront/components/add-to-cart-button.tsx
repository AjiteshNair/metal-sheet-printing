"use client"

import { useState } from "react"
import { addLineItem } from "../lib/cart"

export function AddToCartButton({ variantId, label }: { variantId: string; label: string }) {
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle")

  async function handleClick() {
    setStatus("adding")
    await addLineItem(variantId, 1)
    setStatus("added")
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "adding"}
      className="w-full rounded-full bg-copper py-3 text-sm font-medium text-bg disabled:opacity-50"
    >
      {status === "added" ? "Added ✓" : status === "adding" ? "Adding…" : `Add to cart — ${label}`}
    </button>
  )
}