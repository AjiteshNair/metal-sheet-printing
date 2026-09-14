import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRINT_JOB_MODULE } from "../../../modules/print-job"
import PrintJobModuleService from "../../../modules/print-job/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const printJobModuleService: PrintJobModuleService = req.scope.resolve(PRINT_JOB_MODULE)

  const limit = Number(req.query.limit ?? 20)
  const offset = Number(req.query.offset ?? 0)

  const [printJobs, count] = await printJobModuleService.listAndCountCustomPrintJobs(
    {},
    { skip: offset, take: limit }
  )

  res.status(200).json({ print_jobs: printJobs, count, limit, offset })
}