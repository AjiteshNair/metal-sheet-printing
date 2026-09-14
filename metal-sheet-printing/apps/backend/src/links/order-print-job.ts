import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"
import PrintJobModule from "../modules/print-job"

export default defineLink(
  OrderModule.linkable.order,
  PrintJobModule.linkable.customPrintJob
)