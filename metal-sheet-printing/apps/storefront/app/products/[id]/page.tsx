import { getProduct } from "../../../lib/medusa-client"
import { AddToCartButton } from "../../../components/add-to-cart-button"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return <main className="px-5 py-10 md:px-12">Product not found.</main>
  }

  return (
    <main className="px-5 py-10 md:px-12 md:py-16">
      <div className="md:grid md:grid-cols-2 md:gap-12">
        <div className="space-y-4">
          {(product.images ?? []).slice(0, 3).map((img: { url: string }) => (
            <img
              key={img.url}
              src={img.url}
              alt={product.title}
              className="w-full rounded-lg border border-line object-cover"
            />
          ))}
        </div>

        <div className="mt-8 md:mt-0">
          <h1 className="font-display text-3xl font-medium">{product.title}</h1>
          <p className="mt-3 text-muted">{product.description}</p>

          <div className="mt-6 space-y-3">
            {product.variants?.map((variant: { id: string; title: string }) => (
              <AddToCartButton key={variant.id} variantId={variant.id} label={variant.title} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}