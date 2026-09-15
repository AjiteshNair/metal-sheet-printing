import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function inspectRegion({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  })
  logger.info(`Regions: ${JSON.stringify(regions, null, 2)}`)

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "prices.amount", "prices.currency_code"],
  })
  logger.info(`Variant prices: ${JSON.stringify(variants, null, 2)}`)
}