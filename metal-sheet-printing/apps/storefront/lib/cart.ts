const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!

async function cartFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    credentials: "include", // sends/receives the cart_session cookie
    headers: { "Content-Type": "application/json", ...options.headers },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Cart request failed: ${res.status} ${body}`)
  }
  return res.json()
}

export async function getCart() {
  return cartFetch("/cart")
}

export async function addProductToCart(productId: number, quantity = 1) {
  return cartFetch("/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  })
}

export async function addCustomPrintToCart(customPrintId: number, unitPrice: number) {
  return cartFetch("/cart/items/custom", {
    method: "POST",
    body: JSON.stringify({ customPrintId, unitPrice }),
  })
}

export async function updateLineItemQuantity(itemId: number, quantity: number) {
  return cartFetch(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  })
}

export async function removeLineItem(itemId: number) {
  return cartFetch(`/cart/items/${itemId}`, {
    method: "DELETE",
  })
}