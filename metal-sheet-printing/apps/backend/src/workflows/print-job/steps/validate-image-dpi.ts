import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import sharp from "sharp"

type ValidateDpiInput = {
  image_url: string
  dimensions: string // e.g. "24in x 36in"
  minimum_dpi?: number
}

function parseDimensionsToInches(dimensions: string): { widthIn: number; heightIn: number } {
  const match = dimensions.match(/([\d.]+)\s*in?\s*x\s*([\d.]+)\s*in?/i)
  if (!match) throw new Error(`Unable to parse dimensions string: "${dimensions}"`)
  return { widthIn: parseFloat(match[1]), heightIn: parseFloat(match[2]) }
}

type ValidateDpiOutput = {
  dpi_value: number
  dpi_status: "passed" | "failed"
  passed: boolean
}

export const validateImageDpiStep = createStep(
  "validate-image-dpi-step",
  async (input: ValidateDpiInput, { container }) => {
    const minimumDpi = input.minimum_dpi ?? 150

    const response = await fetch(input.image_url)
    if (!response.ok) throw new Error(`Failed to fetch image for DPI check: ${input.image_url}`)
    const buffer = Buffer.from(await response.arrayBuffer())

    const metadata = await sharp(buffer).metadata()
    if (!metadata.width || !metadata.height) {
      throw new Error("Could not read image pixel dimensions")
    }

    const { widthIn, heightIn } = parseDimensionsToInches(input.dimensions)
    const effectiveDpi = Math.min(metadata.width / widthIn, metadata.height / heightIn)

    const passed = effectiveDpi >= minimumDpi

    return new StepResponse<ValidateDpiOutput>({
      dpi_value: Math.round(effectiveDpi),
      dpi_status: passed ? "passed" : "failed",
      passed,
    })
  }
)