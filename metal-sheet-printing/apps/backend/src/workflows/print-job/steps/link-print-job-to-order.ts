import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { PRINT_JOB_MODULE } from "../../../modules/print-job"

// Note: createRemoteLinkStep is a core Medusa step — this file simply wraps
// it with print-job-specific typing/usage rather than reimplementing linking.
export { createRemoteLinkStep }