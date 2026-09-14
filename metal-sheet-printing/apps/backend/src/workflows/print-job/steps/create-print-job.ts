import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRINT_JOB_MODULE } from "../../../modules/print-job"
import PrintJobModuleService from "../../../modules/print-job/service"

type CreatePrintJobInput = {
  original_image_url: string
  dimensions: string
  finish_type: "matte" | "gloss" | "brushed" | "satin"
  line_item_id?: string
}

export const createPrintJobStep = createStep(
  "create-print-job-step",
  async (input: CreatePrintJobInput, { container }) => {
    const printJobModuleService: PrintJobModuleService = container.resolve(PRINT_JOB_MODULE)

    const printJob = await printJobModuleService.createCustomPrintJobs({
      original_image_url: input.original_image_url,
      dimensions: input.dimensions,
      finish_type: input.finish_type,
      line_item_id: input.line_item_id ?? null,
      status: "pending_processing",
      dpi_status: "pending",
    })

    return new StepResponse(printJob, printJob.id)
  },
  async (printJobId: string | undefined, { container }) => {
    // Compensation: if a later step fails, undo this record creation
    if (!printJobId) return
    const printJobModuleService: PrintJobModuleService = container.resolve(PRINT_JOB_MODULE)
    await printJobModuleService.deleteCustomPrintJobs([printJobId])
  }
)