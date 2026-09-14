import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createPrintJobWorkflow } from "../../../workflows/print-job/create-print-job"

type CreatePrintJobRequestBody = {
  file_name: string
  dimensions: string
  finish_type: "matte" | "gloss" | "brushed" | "satin"
  line_item_id?: string
}

export async function POST(
  req: MedusaRequest<CreatePrintJobRequestBody>,
  res: MedusaResponse
) {
  const { file_name, dimensions, finish_type, line_item_id } = req.body

  if (!file_name || !dimensions || !finish_type) {
    return res.status(400).json({
      message: "file_name, dimensions, and finish_type are required",
    })
  }

  const { result } = await createPrintJobWorkflow(req.scope).run({
    input: { file_name, dimensions, finish_type, line_item_id },
  })

  res.status(200).json({
    print_job: result.printJob,
    upload_credentials: result.uploadCredentials,
  })
}