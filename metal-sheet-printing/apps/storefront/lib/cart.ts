const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!
const CART_ID_KEY = "medusa_cart_id"

const storeHeaders = {
  "Content-Type": "application/json",
  "x-publishable-api-key": PUBLISHABLE_KEY,
}

async function getDefaultRegionId(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/store/regions`, { headers: storeHeaders })
  if (!res.ok) throw new Error("Failed to load regions")
  const data = await res.json()
  if (!data.regions?.[0]) throw new Error("No region configured — create one in Admin first")
  return data.regions[0].id
}

export async function getOrCreateCart(): Promise<string> {
  const existing = localStorage.getItem(CART_ID_KEY)
  if (existing) {
    const check = await fetch(`${BACKEND_URL}/store/carts/${existing}`, { headers: storeHeaders })
    if (check.ok) return existing
  }

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

export async function addLineItem(
  variantId: string,
  quantity = 1,
  metadata?: Record<string, unknown>
) {
  const cartId = await getOrCreateCart()
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/line-items`, {
    method: "POST",
    headers: storeHeaders,
    body: JSON.stringify({ variant_id: variantId, quantity, metadata }),
  })
  if (!res.ok) throw new Error("Failed to add item to cart")
  return res.json()
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