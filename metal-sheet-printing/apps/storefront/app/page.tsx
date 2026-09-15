import { MetalSheenPanel } from "../components/metal-sheen-panel"
import { CatalogGrid } from "../components/catalog-grid"
import Link from "next/link"

export default function HomePage() {
  return (
    <main>
      <MetalSheenPanel>
        <div className="flex min-h-[85svh] flex-col justify-between px-5 py-6 md:min-h-[90vh] md:px-12 md:py-10">
          <nav className="flex items-center justify-between">
            <span className="font-display text-sm font-medium tracking-tight">METAL</span>
            <div className="flex gap-6 text-sm text-muted">
              <Link href="/catalog">Catalog</Link>
              <Link href="/cart">Cart</Link>
            </div>
          </nav>

          <div className="max-w-xl">
            <h1 className="font-display text-4xl font-medium leading-[1.05] md:text-6xl">
              Your photos,
              <br />
              printed in metal.
            </h1>
            <p className="mt-4 max-w-sm text-base text-muted md:text-lg">
              Upload your own artwork or choose from the catalog. Aluminum sheets,
              matte or gloss, ready in days.
            </p>
            <Link
              href="/configure"
              className="mt-8 inline-block rounded-full bg-copper px-6 py-3 text-sm font-medium text-bg md:text-base"
            >
              Start designing
            </Link>
          </div>
        </div>
      </MetalSheenPanel>

      <CatalogGrid />

      <div className="safe-bottom fixed bottom-0 left-0 right-0 z-10 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur md:hidden">
        <Link
          href="/configure"
          className="block w-full rounded-full bg-copper py-3 text-center text-sm font-medium text-bg"
        >
          Upload your artwork
        </Link>
      </div>
    </main>
  )
}