// apps/backend/src/scripts/clear-catalog.ts
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function clearCatalog({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
  })

  if (!products.length) {
    logger.info("No products to delete.")
    return
  }

  await deleteProductsWorkflow(container).run({
    input: { ids: products.map((p) => p.id) },
  })

  logger.info(`Deleted ${products.length} products.`)
}