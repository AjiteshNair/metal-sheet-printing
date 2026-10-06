import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATALOG_ITEMS = [
  { name: 'Desert Ridge', desc: 'Warm desert tones on brushed aluminum.', seed: 'desert-ridge', price: 49.0 },
  { name: 'Ocean Fade', desc: 'Deep blues fading into silver.', seed: 'ocean-fade', price: 49.0 },
  { name: 'Monochrome City', desc: 'Urban skyline in high-contrast black and white.', seed: 'mono-city', price: 49.0 },
  { name: 'Forest Canopy', desc: 'Layered greens with a satin finish.', seed: 'forest-canopy', price: 49.0 },
  { name: 'Copper Sunset', desc: 'Warm gradients that echo the metal itself.', seed: 'copper-sunset', price: 49.0 },
  { name: 'Arctic Minimal', desc: 'Cool whites and greys, ultra clean.', seed: 'arctic-minimal', price: 49.0 },
  { name: 'Neon Nights', desc: 'High-gloss finish for bold color pop.', seed: 'neon-nights', price: 49.0 },
  { name: 'Vintage Bloom', desc: 'Botanical illustration, matte finish.', seed: 'vintage-bloom', price: 49.0 },
];

async function main() {
  for (const item of CATALOG_ITEMS) {
    await prisma.product.create({
      data: {
        name: item.name,
        desc: item.desc,
        price: item.price,
        type: 'STANDARD',
        images: {
          create: [0, 1, 2].map((i) => ({
            imgurl: `https://picsum.photos/seed/${item.seed}-${i}/800/1000`,
            sortWeight: i,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${CATALOG_ITEMS.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
