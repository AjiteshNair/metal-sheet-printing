import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { v2 as cloudinary } from "cloudinary"
import { randomUUID } from "crypto"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

type GenerateUploadUrlInput = {
  file_name: string
}

type GenerateUploadUrlOutput = {
  signature: string
  timestamp: number
  api_key: string
  cloud_name: string
  public_id: string
  upload_endpoint: string
  publicUrl: string
}

export const generateUploadUrlStep = createStep(
  "generate-upload-url-step",
  async (input: GenerateUploadUrlInput, { container }) => {
    const timestamp = Math.round(Date.now() / 1000)
    const ext = input.file_name.split(".").pop() ?? "jpg"
    const baseName = input.file_name.replace(/\.[^/.]+$/, "")
    const public_id = `print-jobs/originals/${randomUUID()}-${baseName}`

    // Only signed params go into the signature — Cloudinary requires the
    // exact same params to be sent by the client on the actual upload call.
    const paramsToSign = { timestamp, public_id }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    )

    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME!
    const publicUrl = `https://res.cloudinary.com/${cloud_name}/image/upload/${public_id}.${ext}`

    return new StepResponse<GenerateUploadUrlOutput>({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY!,
      cloud_name,
      public_id,
      upload_endpoint: `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      publicUrl,
    })
  }
)