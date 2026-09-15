const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!

const storeHeaders = {
  "Content-Type": "application/json",
  "x-publishable-api-key": PUBLISHABLE_KEY,
}

export async function createPrintJob(input: {
  file_name: string
  dimensions: string
  finish_type: "matte" | "gloss" | "brushed" | "satin"
}) {
  const res = await fetch(`${BACKEND_URL}/store/print-jobs`, {
    method: "POST",
    headers: storeHeaders,
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("Failed to create print job")
  return res.json() as Promise<{
    print_job: { id: string }
    upload_credentials: {
      signature: string
      timestamp: number
      api_key: string
      cloud_name: string
      public_id: string
      upload_endpoint: string
    }
  }>
}

export async function uploadToCloudinary(
  file: File,
  credentials: {
    signature: string
    timestamp: number
    api_key: string
    public_id: string
    upload_endpoint: string
  }
) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("signature", credentials.signature)
  formData.append("timestamp", String(credentials.timestamp))
  formData.append("api_key", credentials.api_key)
  formData.append("public_id", credentials.public_id)

  const res = await fetch(credentials.upload_endpoint, { method: "POST", body: formData })
  if (!res.ok) throw new Error("Cloudinary upload failed")
  return res.json()
}

export async function confirmPrintJob(printJobId: string) {
  const res = await fetch(`${BACKEND_URL}/store/print-jobs/${printJobId}/validate`, {
    method: "POST",
    headers: storeHeaders,
  })
  if (!res.ok) throw new Error("DPI validation failed")
  return res.json()
}

export async function listCatalogProducts() {
  const res = await fetch(`${BACKEND_URL}/store/products?limit=50`, {
    headers: storeHeaders,
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to load catalog products: ${res.status} ${body}`)
  }
  const data = await res.json()
  return data.products
    .filter((p: any) => p.handle !== "custom-print")
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      images: (p.images ?? []).map((img: any) => img.url).slice(0, 3),
      variants: (p.variants ?? []).map((v: any) => ({ id: v.id, title: v.title })),
    })) as Array<{
    id: string
    title: string
    images: string[]
    variants: { id: string; title: string }[]
  }>
}

export async function getProduct(id: string) {
  const res = await fetch(`${BACKEND_URL}/store/products/${id}`, {
    headers: storeHeaders,
    cache: "no-store",
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.product
}