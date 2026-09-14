import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRINT_JOB_MODULE } from "../../../../modules/print-job"
import PrintJobModuleService from "../../../../modules/print-job/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const printJobModuleService: PrintJobModuleService = req.scope.resolve(PRINT_JOB_MODULE)

  const printJob = await printJobModuleService.retrieveCustomPrintJob(id)

  if (!printJob) {
    return res.status(404).json({ message: `Print job ${id} not found` })
  }

  res.status(200).json({ print_job: printJob })
}