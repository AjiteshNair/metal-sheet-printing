"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCart, removeLineItem, updateLineItemQuantity } from "../../lib/cart"

type CartItem = {
  id: number
  quantity: number
  unitPrice: string | number
  product: { name: string; images: { imgurl: string }[] } | null
  customPrint: { imageUrl: string; dimensions: string } | null
}

export default function CartPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const c = await getCart()
    setCart(c)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleRemove(itemId: number) {
    const updated = await removeLineItem(itemId)
    setCart(updated)
  }

  async function handleQuantityChange(itemId: number, quantity: number) {
    if (quantity < 1) return
    const updated = await updateLineItemQuantity(itemId, quantity)
    setCart(updated)
  }

  if (loading) {
    return <main className="px-5 py-10 md:px-12">Loading cart…</main>
  }

  if (!cart || !cart.items?.length) {
    return (
      <main className="px-5 py-16 text-center md:px-12">
        <p className="text-muted">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-copper">
          Browse the catalog
        </Link>
      </main>
    )
  }

  const subtotal = cart.items.reduce(
    (sum: number, item: CartItem) => sum + Number(item.unitPrice) * item.quantity,
    0
  )

  return (
    <main className="px-5 py-10 md:px-12 md:py-16">
      <h1 className="font-display text-2xl font-medium md:text-3xl">Your cart</h1>

      <div className="mt-8 space-y-6">
        {cart.items.map((item: CartItem) => {
          const name = item.product?.name ?? "Custom Metal Print"
          const thumbnail = item.product?.images?.[0]?.imgurl ?? item.customPrint?.imageUrl
          const dimensions = item.customPrint?.dimensions

          return (
            <div key={item.id} className="flex items-center gap-4 border-b border-line pb-6">
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt={name}
                  className="h-20 w-20 rounded-md border border-line object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{name}</p>
                {dimensions && <p className="font-mono text-xs text-muted">{dimensions}</p>}
                <p className="mt-1 font-mono text-xs text-muted">
                  ${Number(item.unitPrice).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="h-8 w-8 rounded-full border border-line text-sm"
                >
                  −
                </button>
                <span className="w-6 text-center font-mono text-sm">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="h-8 w-8 rounded-full border border-line text-sm"
                >
                  +
                </button>
              </div>
              <button onClick={() => handleRemove(item.id)} className="text-sm text-muted underline">
                Remove
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="font-mono text-lg">Subtotal: ${subtotal.toFixed(2)}</p>
        <Link
          href="/checkout"
          className="rounded-full bg-copper px-6 py-3 text-sm font-medium text-bg"
        >
          Checkout
        </Link>
      </div>
    </main>
  )
}