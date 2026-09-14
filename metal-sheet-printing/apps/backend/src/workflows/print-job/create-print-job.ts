import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { generateUploadUrlStep } from "./steps/generate-upload-url"
import { createPrintJobStep } from "./steps/create-print-job"

type CreatePrintJobWorkflowInput = {
  file_name: string
  dimensions: string
  finish_type: "matte" | "gloss" | "brushed" | "satin"
  line_item_id?: string
}

export const createPrintJobWorkflow = createWorkflow(
  "create-print-job-workflow",
  (input: CreatePrintJobWorkflowInput) => {
    const uploadCredentials = generateUploadUrlStep({
      file_name: input.file_name,
    })

    const printJob = createPrintJobStep({
      original_image_url: uploadCredentials.publicUrl,
      dimensions: input.dimensions,
      finish_type: input.finish_type,
      line_item_id: input.line_item_id,
    })

    return new WorkflowResponse({ printJob, uploadCredentials })
  }
)