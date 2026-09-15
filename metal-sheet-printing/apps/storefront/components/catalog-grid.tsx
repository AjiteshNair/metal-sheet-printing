import { listCatalogProducts } from "../lib/medusa-client"
import { ProductRow } from "./product-row"

export async function CatalogGrid() {
  const products = await listCatalogProducts()

  return (
    <section className="px-5 md:px-12">
      <h2 className="pt-10 font-display text-xl font-medium md:pt-16">From the catalog</h2>
      <div className="mt-4">
        {products.map((product) => (
          <ProductRow
            key={product.id}
            id={product.id}
            title={product.title}
            images={product.images}
            variants={product.variants}
          />
        ))}
      </div>
    </section>
  )
}