"use client"

import Link from "next/link"
import { motion, Variants } from "framer-motion"

type ProductRowProps = {
  id: string
  title: string
  images: string[]
}

const fanVariants: Variants = {
  hidden: (i: number) => ({
    x: `${(1 - i) * 108}%`, // converge toward the center slot (index 1)
    rotate: (1 - i) * 10,
    scale: 0.85,
    opacity: i === 1 ? 1 : 0,
  }),
  visible: (i: number) => ({
    x: "0%",
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 160, damping: 20, delay: i * 0.12 },
  }),
}

export function ProductRow({ id, title, images }: ProductRowProps) {
  const displayImages = images.slice(0, 3)

  return (
    <Link
      href={`/products/${id}`}
      className="flex flex-col items-center gap-6 border-b border-line py-10 md:flex-row md:gap-12 md:py-14"
    >
      <div className="grid w-full grid-cols-3 gap-3 md:w-[420px]">
        {displayImages.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt={title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fanVariants}
            className="aspect-[3/4] w-full rounded-lg border border-line object-cover shadow-xl"
            style={{ zIndex: i === 1 ? 2 : 1 }}
          />
        ))}
      </div>

      <div className="text-center md:text-left">
        <h3 className="font-display text-xl font-medium md:text-2xl">{title}</h3>
      </div>
    </Link>
  )
}