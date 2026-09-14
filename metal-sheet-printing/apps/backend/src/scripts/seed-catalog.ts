import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

const CATALOG_ITEMS = [
  { title: "Desert Ridge", description: "Warm desert tones on brushed aluminum.", image: "https://picsum.photos/seed/desert-ridge/800/1000" },
  { title: "Ocean Fade", description: "Deep blues fading into silver.", image: "https://picsum.photos/seed/ocean-fade/800/1000" },
  { title: "Monochrome City", description: "Urban skyline in high-contrast black and white.", image: "https://picsum.photos/seed/mono-city/800/1000" },
  { title: "Forest Canopy", description: "Layered greens with a satin finish.", image: "https://picsum.photos/seed/forest-canopy/800/1000" },
  { title: "Copper Sunset", description: "Warm gradients that echo the metal itself.", image: "https://picsum.photos/seed/copper-sunset/800/1000" },
  { title: "Arctic Minimal", description: "Cool whites and greys, ultra clean.", image: "https://picsum.photos/seed/arctic-minimal/800/1000" },
  { title: "Neon Nights", description: "High-gloss finish for bold color pop.", image: "https://picsum.photos/seed/neon-nights/800/1000" },
  { title: "Vintage Bloom", description: "Botanical illustration, matte finish.", image: "https://picsum.photos/seed/vintage-bloom/800/1000" },
]

export default async function seedCatalog({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  const defaultSalesChannel = salesChannels[0]

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "type"],
  })
  const defaultShippingProfile =
    shippingProfiles.find((p) => p.type === "default") ?? shippingProfiles[0]

  if (!defaultSalesChannel || !defaultShippingProfile) {
    logger.error(
      "No default sales channel or shipping profile found — run the base install seed first, or create these in Admin before re-running this script."
    )
    return
  }

  await createProductsWorkflow(container).run({
    input: {
      products: CATALOG_ITEMS.map((item) => ({
        title: item.title,
        description: item.description,
        status: "published",
        images: [{ url: item.image }],
        thumbnail: item.image,
        options: [{ title: "Finish", values: ["Matte", "Gloss"] }],
        variants: [
          {
            title: "Matte",
            options: { Finish: "Matte" },
            prices: [{ amount: 4900, currency_code: "usd" }],
          },
          {
            title: "Gloss",
            options: { Finish: "Gloss" },
            prices: [{ amount: 5400, currency_code: "usd" }],
          },
        ],
        sales_channels: [{ id: defaultSalesChannel.id }],
        shipping_profile_id: defaultShippingProfile.id,
      })),
    },
  })

  logger.info(`Seeded ${CATALOG_ITEMS.length} catalog products.`)
}