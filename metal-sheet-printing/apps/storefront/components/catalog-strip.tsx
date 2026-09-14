import { listCatalogProducts } from "../lib/medusa-client"

export async function CatalogStrip() {
  const products = await listCatalogProducts()

  return (
    <section className="px-5 py-10 md:px-12 md:py-16">
      <h2 className="font-display text-xl font-medium">From the catalog</h2>
      <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[70vw] shrink-0 snap-start rounded-lg border border-line bg-surface p-4 md:w-64"
          >
            {product.thumbnail && (
              <img
                src={product.thumbnail}
                alt={product.title}
                className="aspect-[4/5] w-full rounded-md object-cover"
              />
            )}
            <p className="mt-3 text-sm font-medium">{product.title}</p>
          </div>
        ))}
      </div>
    </section>
  )
}