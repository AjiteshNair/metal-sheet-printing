import { MedusaService } from "@medusajs/framework/utils"
import CustomPrintJob from "./models/print-job"

class PrintJobModuleService extends MedusaService({
  CustomPrintJob,
}) {
  // MedusaService auto-generates CRUD methods:
  // createCustomPrintJobs, listCustomPrintJobs, updateCustomPrintJobs,
  // retrieveCustomPrintJob, deleteCustomPrintJobs, etc.
  // Custom business methods (DPI validation orchestration, etc.) go here in Module 2.
}

export default PrintJobModuleService