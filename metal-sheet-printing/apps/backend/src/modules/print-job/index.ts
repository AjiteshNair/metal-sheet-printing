import { Module } from "@medusajs/framework/utils"
import PrintJobModuleService from "./service"

export const PRINT_JOB_MODULE = "printJobModuleService"

export default Module(PRINT_JOB_MODULE, {
  service: PrintJobModuleService,
})