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
    x: 0,
    y: 0,
    rotate: 0,
    scale: 0.9 - i * 0.03,
    opacity: i === 0 ? 1 : 0,
  }),
  visible: (i: number) => ({
    x: i * 26,
    y: i * 10,
    rotate: (i - 1) * 6,
    scale: 1 - i * 0.04,
    opacity: 1,
    transition: { type: "spring", stiffness: 180, damping: 18, delay: i * 0.12 },
  }),
}

export function ProductRow({ id, title, images }: ProductRowProps) {
  const displayImages = images.slice(0, 3)

  return (
    <Link
      href={`/products/${id}`}
      className="flex flex-col items-center gap-6 border-b border-line py-10 md:flex-row md:gap-12 md:py-14"
    >
      <div className="relative h-64 w-full shrink-0 md:h-72 md:w-72">
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
            className="absolute left-1/2 top-0 h-full w-48 -translate-x-1/2 rounded-lg border border-line object-cover shadow-xl md:w-56"
            style={{ zIndex: 3 - i }}
          />
        ))}
      </div>

      <div className="text-center md:text-left">
        <h3 className="font-display text-xl font-medium md:text-2xl">{title}</h3>
      </div>
    </Link>
  )
}