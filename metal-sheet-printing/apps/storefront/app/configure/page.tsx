"use client"

import { useEffect, useState } from "react"
import { createPrintJob, uploadToCloudinary, confirmPrintJob } from "../../lib/medusa-client"

type Stage = "idle" | "uploading" | "validating" | "ready" | "failed"

export default function ConfigurePage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [width, setWidth] = useState("24")
  const [height, setHeight] = useState("36")
  const [finish, setFinish] = useState<"matte" | "gloss" | "brushed" | "satin">("matte")
  const [stage, setStage] = useState<Stage>("idle")
  const [dpiInfo, setDpiInfo] = useState<{ dpi_value?: number; dpi_status?: string } | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url) // avoid leaking blob URLs on file change/unmount
  }, [file])

  async function handleSubmit() {
    if (!file) return
    setStage("uploading")

    const { print_job, upload_credentials } = await createPrintJob({
      file_name: file.name,
      dimensions: `${width}in x ${height}in`,
      finish_type: finish,
    })

    await uploadToCloudinary(file, upload_credentials)

    setStage("validating")
    const { print_job: validated } = await confirmPrintJob(print_job.id)

    setDpiInfo({ dpi_value: validated.dpi_value, dpi_status: validated.dpi_status })
    setStage(validated.status === "ready" ? "ready" : "failed")
  }

  return (
    <main className="min-h-svh px-5 pb-28 pt-8 md:px-12 md:pb-16">
      <h1 className="font-display text-2xl font-medium md:text-3xl">Design your print</h1>

      <div className="mt-8 md:grid md:grid-cols-2 md:gap-12">
        <div className="space-y-6 md:max-w-md">
          <label className="block">
            <span className="text-sm text-muted">Artwork</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm"
            />
          </label>

          <div className="flex gap-4">
            <label className="flex-1">
              <span className="text-sm text-muted">Width (in)</span>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-3 font-mono text-sm"
              />
            </label>
            <label className="flex-1">
              <span className="text-sm text-muted">Height (in)</span>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-3 font-mono text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-muted">Finish</span>
            <select
              value={finish}
              onChange={(e) => setFinish(e.target.value as typeof finish)}
              className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-3 text-sm"
            >
              <option value="matte">Matte</option>
              <option value="gloss">Gloss</option>
              <option value="brushed">Brushed</option>
              <option value="satin">Satin</option>
            </select>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!file || stage === "uploading" || stage === "validating"}
            className="w-full rounded-full bg-copper py-3 text-sm font-medium text-bg disabled:opacity-50"
          >
            {stage === "uploading" && "Uploading…"}
            {stage === "validating" && "Checking resolution…"}
            {(stage === "idle" || stage === "ready" || stage === "failed") &&
              "Upload and check quality"}
          </button>

          {stage === "ready" && dpiInfo && (
            <p className="font-mono text-sm text-steel">
              {dpiInfo.dpi_value} DPI — looks sharp at this size.
            </p>
          )}
          {stage === "failed" && dpiInfo && (
            <p className="font-mono text-sm text-copper">
              {dpiInfo.dpi_value} DPI — too low for {width}×{height}in. Try a larger file or
              smaller size.
            </p>
          )}
        </div>

        {/* Preview column — stacks below the form on mobile via grid's natural flow */}
        <div className="mt-8 md:mt-0">
          {previewUrl ? (
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-line">
              <img
                src={previewUrl}
                alt="Your upload preview"
                className="h-full w-full object-cover"
              />
              <div className="glossy-overlay pointer-events-none absolute inset-0" />
            </div>
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-dashed border-line text-sm text-muted">
              Preview appears here once you upload artwork
            </div>
          )}
        </div>
      </div>
    </main>
  )
}