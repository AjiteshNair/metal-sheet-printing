const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!

export async function createPrintJob(input: { file_name: string }) {
  const res = await fetch(`${BACKEND_URL}/custom-prints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: input.file_name }),
  })
  if (!res.ok) throw new Error("Failed to create print job")
  return res.json() as Promise<{
    customPrint: { id: number }
    uploadCredentials: {
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

export async function confirmPrintJob(printJobId: number) {
  const res = await fetch(`${BACKEND_URL}/custom-prints/${printJobId}/validate`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("DPI validation failed")
  return res.json()
}

export async function listCatalogProducts() {
  const res = await fetch(`${BACKEND_URL}/products`, {
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to load catalog products: ${res.status} ${body}`)
  }
  const data = await res.json()
  return data
    .filter((p: any) => p.isActive)
    .map((p: any) => ({
      id: p.id,
      title: p.name,
      price: Number(p.price),
      images: (p.images ?? []).map((img: any) => img.imgurl).slice(0, 3),
    })) as Array<{ id: number; title: string; price: number; images: string[] }>
}

export async function getProduct(id: string) {
  const res = await fetch(`${BACKEND_URL}/products/${id}`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}