import { model } from "@medusajs/framework/utils"

const CustomPrintJob = model.define("custom_print_job", {
  id: model.id().primaryKey(),

  // --- Linkage ---
  // We intentionally do NOT declare a hard relation to Order here.
  // Order/Cart/LineItem live in Medusa's core `order` module.
  // Cross-module association is handled via Module Links (see src/links/),
  // which Medusa persists in a separate pivot table.
  // We still store the raw order_id as a plain text reference for fast lookups/filtering.
  order_id: model.text().nullable(),
  line_item_id: model.text().nullable(),

  // --- Asset References (actual files live in S3/R2, we store URLs/keys) ---
  original_image_url: model.text(),
  processed_image_url: model.text().nullable(),

  // --- Print Specifications ---
  dimensions: model.text(), // e.g. "24in x 36in" — consider a structured JSON later if needed
  finish_type: model.enum(["matte", "gloss", "brushed", "satin"]),

  // --- Quality Control ---
  dpi_status: model.enum(["pending", "passed", "failed"]).default("pending"),
  dpi_value: model.number().nullable(), // actual computed DPI, useful for support/debugging

  // --- Job Lifecycle ---
  status: model
    .enum(["pending_processing", "processing", "ready", "failed", "cancelled"])
    .default("pending_processing"),

  // --- Diagnostics ---
  failure_reason: model.text().nullable(),
  metadata: model.json().nullable(), // free-form: color profile, bleed settings, etc.
})

export default CustomPrintJob