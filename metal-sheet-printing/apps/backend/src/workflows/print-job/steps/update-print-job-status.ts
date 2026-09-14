import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRINT_JOB_MODULE } from "../../../modules/print-job"
import PrintJobModuleService from "../../../modules/print-job/service"

type UpdateStatusInput = {
  print_job_id: string
  dpi_value?: number
  dpi_status?: "pending" | "passed" | "failed"
  status: "pending_processing" | "processing" | "ready" | "failed" | "cancelled"
  failure_reason?: string
}

export const updatePrintJobStatusStep = createStep(
  "update-print-job-status-step",
  async (input: UpdateStatusInput, { container }) => {
    const printJobModuleService: PrintJobModuleService = container.resolve(PRINT_JOB_MODULE)

    const previous = await printJobModuleService.retrieveCustomPrintJob(input.print_job_id)

    const updated = await printJobModuleService.updateCustomPrintJobs({
      id: input.print_job_id,
      dpi_value: input.dpi_value,
      dpi_status: input.dpi_status,
      status: input.status,
      failure_reason: input.failure_reason,
    })

    return new StepResponse(updated, previous) // compensation data = prior state
  },
  async (previous, { container }) => {
    if (!previous) return
    const printJobModuleService: PrintJobModuleService = container.resolve(PRINT_JOB_MODULE)
    await printJobModuleService.updateCustomPrintJobs({
      id: previous.id,
      status: previous.status,
      dpi_status: previous.dpi_status,
      dpi_value: previous.dpi_value,
    })
  }
)