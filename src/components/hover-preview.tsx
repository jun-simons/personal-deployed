// src/components/hover-preview.tsx
//
// Floats a small preview beside the cursor while it's over any descendant with
// a `data-preview` URL. Images are rendered up front (invisible) so hovering is
// instant; videos show their first frame and play muted while hovered. The
// whole thing is skipped on devices that can't hover.
'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Preview } from '@/app/art/pieces'

interface HoverPreviewProps {
  previews: Preview[]
  children: ReactNode
}

const frame = (active: boolean) =>
  `absolute left-10 top-0 h-auto w-60 max-w-none -translate-y-1/2 rounded-sm transition-[opacity,transform] duration-200 ease-out ${
    active ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
  }`

export default function HoverPreview({ previews, children }: HoverPreviewProps) {
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
        {previews.map((p) =>
          p.kind === 'image' ? (
            <Image
              key={p.src}
              src={p.src}
              alt=""
              width={480}
              height={360}
              sizes="240px"
              loading="eager"
              className={frame(active === p.src)}
            />
          ) : (
            <VideoPreview key={p.src} src={p.src} active={active === p.src} />
          )
        )}
      </motion.div>
    </div>
  )
}

function VideoPreview({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (active) void video.play().catch(() => {})
    else video.pause()
  }, [active])

  return (
    <video
      ref={ref}
      // #t= makes browsers show a real first frame instead of a black box
      src={`${src}#t=0.1`}
      muted
      loop
      playsInline
      preload="metadata"
      className={frame(active)}
    />
  )
}
