// src/components/hover-preview.tsx
//
// Floats a small image beside the cursor while it's over any descendant with a
// `data-preview` URL. All images are rendered up front (invisible) so hovering
// is instant, and the whole thing is skipped on devices that can't hover.
'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import Image from 'next/image'
import { useState, type ReactNode } from 'react'

interface HoverPreviewProps {
  images: string[]
  children: ReactNode
}

export default function HoverPreview({ images, children }: HoverPreviewProps) {
  const [active, setActive] = useState<string | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 350, damping: 32, mass: 0.6 })
  const springY = useSpring(y, { stiffness: 350, damping: 32, mass: 0.6 })

  const onMouseMove = (e: React.MouseEvent) => {
    const target = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-preview]') : null
    const src = target?.dataset.preview ?? null
    if (src !== active) {
      // jump (don't glide) when a preview first appears
      if (!active) {
        springX.jump(e.clientX)
        springY.jump(e.clientY)
      }
      setActive(src)
    }
    x.set(e.clientX)
    y.set(e.clientY)
  }

  return (
    <div onMouseMove={onMouseMove} onMouseLeave={() => setActive(null)}>
      {children}
      <motion.div
        aria-hidden
        style={{ x: springX, y: springY }}
        className="pointer-events-none fixed left-0 top-0 z-20 hidden [@media(hover:hover)]:block"
      >
        {images.map((src) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={480}
            height={360}
            sizes="240px"
            loading="eager"
            className={`absolute left-10 top-0 h-auto w-60 max-w-none -translate-y-1/2 rounded-sm transition-[opacity,transform] duration-200 ease-out ${
              active === src ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          />
        ))}
      </motion.div>
    </div>
  )
}
