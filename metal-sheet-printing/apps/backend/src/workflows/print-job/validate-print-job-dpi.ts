import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk"
import { validateImageDpiStep } from "./steps/validate-image-dpi"
import { updatePrintJobStatusStep } from "./steps/update-print-job-status"

type ValidatePrintJobDpiInput = {
  print_job_id: string
  image_url: string
  dimensions: string
}

type StatusFields = {
  status: "ready" | "failed"
  failure_reason: string | undefined
}

export const validatePrintJobDpiWorkflow = createWorkflow(
  "validate-print-job-dpi-workflow",
  (input: ValidatePrintJobDpiInput) => {
    const dpiResult = validateImageDpiStep({
      image_url: input.image_url,
      dimensions: input.dimensions,
    })

    const statusFields = transform(
      { dpiResult },
      ({ dpiResult }): StatusFields => ({
        status: dpiResult.passed ? "ready" : "failed",
        failure_reason: dpiResult.passed
          ? undefined
          : "Image resolution too low for selected print dimensions",
      })
    )

    const updated = updatePrintJobStatusStep({
      print_job_id: input.print_job_id,
      dpi_value: dpiResult.dpi_value,
      dpi_status: dpiResult.dpi_status,
      status: statusFields.status,
      failure_reason: statusFields.failure_reason,
    })

    return new WorkflowResponse(updated)
  }
)