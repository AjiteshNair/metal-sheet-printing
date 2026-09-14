import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { PRINT_JOB_MODULE } from "../../modules/print-job"

type AttachPrintJobToOrderInput = {
  order_id: string
  print_job_id: string
}

export const attachPrintJobToOrderWorkflow = createWorkflow(
  "attach-print-job-to-order-workflow",
  (input: AttachPrintJobToOrderInput) => {
    const link = createRemoteLinkStep([
      {
        [Modules.ORDER]: { order_id: input.order_id },
        [PRINT_JOB_MODULE]: { custom_print_job_id: input.print_job_id },
      },
    ])

    return new WorkflowResponse(link)
  }
)