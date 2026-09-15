const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!
const CART_ID_KEY = "medusa_cart_id"
const REGION_ID_KEY = "medusa_region_id"

const storeHeaders = {
  "Content-Type": "application/json",
  "x-publishable-api-key": PUBLISHABLE_KEY,
}

async function getDefaultRegionId(): Promise<string> {
  const cached = localStorage.getItem(REGION_ID_KEY)
  if (cached) return cached // avoid re-fetching /store/regions on every single call

  const res = await fetch(`${BACKEND_URL}/store/regions`, { headers: storeHeaders })
  if (!res.ok) throw new Error("Failed to load regions")
  const data = await res.json()
  if (!data.regions?.[0]) throw new Error("No region configured — create one in Admin first")
  localStorage.setItem(REGION_ID_KEY, data.regions[0].id)
  return data.regions[0].id
}

export function getCartId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CART_ID_KEY)
}

export async function getOrCreateCart(): Promise<string> {
  const existing = getCartId()
  if (existing) return existing // trust the cached ID; only recover from failure below

  const regionId = await getDefaultRegionId()
  const res = await fetch(`${BACKEND_URL}/store/carts`, {
    method: "POST",
    headers: storeHeaders,
    body: JSON.stringify({ region_id: regionId }),
  })
  if (!res.ok) throw new Error("Failed to create cart")
  const data = await res.json()
  localStorage.setItem(CART_ID_KEY, data.cart.id)
  return data.cart.id
}

async function clearStaleCartAndRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch {
    localStorage.removeItem(CART_ID_KEY)
    localStorage.removeItem(REGION_ID_KEY)
    return fn()
  }
}

export async function getCart() {
  const cartId = getCartId()
  if (!cartId) return null
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}`, { headers: storeHeaders })
  if (!res.ok) return null
  const data = await res.json()
  return data.cart
}

export async function addLineItem(
  variantId: string,
  quantity = 1,
  metadata?: Record<string, unknown>
) {
  return clearStaleCartAndRetry(async () => {
    const cartId = await getOrCreateCart()
    const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({ variant_id: variantId, quantity, metadata }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Failed to add item to cart: ${res.status} ${body}`)
    }
    return res.json()
  })
}

export async function updateLineItemQuantity(lineItemId: string, quantity: number) {
  const cartId = getCartId()
  if (!cartId) throw new Error("No active cart")
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: "POST",
    headers: storeHeaders,
    body: JSON.stringify({ quantity }),
  })
  if (!res.ok) throw new Error("Failed to update quantity")
  return res.json() // returns the updated cart — callers should use this, not re-fetch
}

export async function removeLineItem(lineItemId: string) {
  const cartId = getCartId()
  if (!cartId) throw new Error("No active cart")
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: "DELETE",
    headers: storeHeaders,
  })
  if (!res.ok) throw new Error("Failed to remove item")
  return res.json() // also returns the updated cart
}

export async function addCustomPrintToCart(
  printJobId: string,
  dimensions: string,
  finishType: string
) {
  const res = await fetch(`${BACKEND_URL}/store/products?handle=custom-print`, {
    headers: storeHeaders,
  })
  if (!res.ok) throw new Error("Failed to look up custom-print product")
  const data = await res.json()
  const variantId = data.products?.[0]?.variants?.[0]?.id
  if (!variantId) throw new Error("Custom print product not found — re-run the seed script")

  return addLineItem(variantId, 1, {
    print_job_id: printJobId,
    dimensions,
    finish_type: finishType,
  })
}