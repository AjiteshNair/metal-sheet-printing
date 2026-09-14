import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRINT_JOB_MODULE } from "../modules/print-job"
import PrintJobModuleService from "../modules/print-job/service"
import { attachPrintJobToOrderWorkflow } from "../workflows/print-job/attach-print-job-to-order"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const printJobModuleService: PrintJobModuleService = container.resolve(PRINT_JOB_MODULE)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "items.id"],
    filters: { id: orderId },
  })

  const order = orders[0]
  if (!order?.items?.length) return

  const lineItemIds = order.items.map((item: { id: string }) => item.id)

  const printJobs = await printJobModuleService.listCustomPrintJobs({
    line_item_id: lineItemIds,
  })

  for (const printJob of printJobs) {
    await attachPrintJobToOrderWorkflow(container).run({
      input: {
        order_id: orderId,
        print_job_id: printJob.id,
      },
    })
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}