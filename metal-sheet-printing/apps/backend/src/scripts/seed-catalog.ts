import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

const CATALOG_ITEMS = [
  { title: "Desert Ridge", description: "Warm desert tones on brushed aluminum.", seed: "desert-ridge" },
  { title: "Ocean Fade", description: "Deep blues fading into silver.", seed: "ocean-fade" },
  { title: "Monochrome City", description: "Urban skyline in high-contrast black and white.", seed: "mono-city" },
  { title: "Forest Canopy", description: "Layered greens with a satin finish.", seed: "forest-canopy" },
  { title: "Copper Sunset", description: "Warm gradients that echo the metal itself.", seed: "copper-sunset" },
  { title: "Arctic Minimal", description: "Cool whites and greys, ultra clean.", seed: "arctic-minimal" },
  { title: "Neon Nights", description: "High-gloss finish for bold color pop.", seed: "neon-nights" },
  { title: "Vintage Bloom", description: "Botanical illustration, matte finish.", seed: "vintage-bloom" },
]

function imagesFor(seed: string) {
  return [0, 1, 2].map((i) => ({ url: `https://picsum.photos/seed/${seed}-${i}/800/1000` }))
}

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
    logger.error("No default sales channel or shipping profile found — set these up in Admin first.")
    return
  }

  await createProductsWorkflow(container).run({
    input: {
      products: [
        ...CATALOG_ITEMS.map((item) => ({
          title: item.title,
          description: item.description,
          status: "published" as const,
          images: imagesFor(item.seed),
          thumbnail: imagesFor(item.seed)[0].url,
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
        {
          title: "Custom Metal Print",
          handle: "custom-print",
          description: "Your own uploaded artwork, printed on metal.",
          status: "published" as const,
          options: [{ title: "Type", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              options: { Type: "Standard" },
              prices: [{ amount: 5900, currency_code: "usd" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
          shipping_profile_id: defaultShippingProfile.id,
        },
      ],
    },
  })

  logger.info(`Seeded ${CATALOG_ITEMS.length} catalog products + 1 custom-print vehicle product.`)
}