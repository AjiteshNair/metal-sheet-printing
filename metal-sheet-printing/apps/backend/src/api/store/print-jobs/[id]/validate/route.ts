import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRINT_JOB_MODULE } from "../../../../../modules/print-job"
import PrintJobModuleService from "../../../../../modules/print-job/service"
import { validatePrintJobDpiWorkflow } from "../../../../../workflows/print-job/validate-print-job-dpi"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  const printJobModuleService: PrintJobModuleService = req.scope.resolve(PRINT_JOB_MODULE)
  const printJob = await printJobModuleService.retrieveCustomPrintJob(id)

  if (!printJob) {
    return res.status(404).json({ message: `Print job ${id} not found` })
  }

  const { result } = await validatePrintJobDpiWorkflow(req.scope).run({
    input: {
      print_job_id: printJob.id,
      image_url: printJob.original_image_url,
      dimensions: printJob.dimensions,
    },
  })

  res.status(200).json({ print_job: result })
}