// src/components/art/slideshow.tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import type { MediaItem } from '@/app/art/pieces'

// Encoded inline SVG cursors — white arrow with a subtle black outline so
// they read on any background. Hotspot is (16, 16) — center of a 32x32 svg.
function makeCursor(dir: 'left' | 'right'): string {
  const path =
    dir === 'left' ? 'M20 8 L10 16 L20 24' : 'M12 8 L22 16 L12 24'
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>` +
    `<path d='${path}' stroke='black' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round' fill='none' opacity='0.5'/>` +
    `<path d='${path}' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/>` +
    `</svg>`
  const fallback = dir === 'left' ? 'w-resize' : 'e-resize'
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 16 16, ${fallback}`
}

const LEFT_CURSOR = makeCursor('left')
const RIGHT_CURSOR = makeCursor('right')

interface SlideshowProps {
  media: MediaItem[]
}

export default function Slideshow({ media }: SlideshowProps) {
  const [index, setIndex] = useState(0)
  const [side, setSide] = useState<'left' | 'right'>('right')
  const containerRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + media.length) % media.length)
    },
    [media.length]
  )

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(1)
      else if (e.key === 'ArrowLeft') goTo(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo])

  const onMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const next: 'left' | 'right' =
      e.clientX - rect.left < rect.width / 2 ? 'left' : 'right'
    if (next !== side) setSide(next)
  }

  const onClick = () => {
    goTo(side === 'left' ? -1 : 1)
  }

  const current = media[index]

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onClick={onClick}
        className="relative flex-1 min-h-0 select-none"
        style={{ cursor: side === 'left' ? LEFT_CURSOR : RIGHT_CURSOR }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center px-6 sm:px-12"
          >
            <MediaContent item={current} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption + counter — outside the click area so cursor is normal here */}
      <div className="pt-4 pb-2 px-6 sm:px-8 flex items-center justify-between gap-4 font-monoreg text-sm text-neutral-400">
        <span className="truncate">{current.caption ?? ''}</span>
        <span className="tabular-nums text-neutral-500 shrink-0">
          {index + 1} / {media.length}
        </span>
      </div>
    </div>
  )
}

const IMAGE_SIZES = '(min-width: 1152px) 1024px, 90vw'

function MediaContent({ item }: { item: MediaItem }) {
  if (item.type === 'image') {
    return (
      <div className="relative w-full h-full">
        <Image
          src={item.src}
          alt={item.alt ?? ''}
          fill
          sizes={IMAGE_SIZES}
          className="object-contain select-none"
          draggable={false}
          priority
        />
      </div>
    )
  }

  if (item.type === 'video') {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'auto' }}
        className="max-h-full max-w-full flex items-center justify-center"
      >
        <video
          src={item.src}
          poster={item.poster}
          controls
          playsInline
          loop={item.loop ?? true}
          muted={item.muted ?? true}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    )
  }

  // audio
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ cursor: 'auto' }}
      className="flex flex-col items-center gap-6 max-h-full"
    >
      {item.cover && (
        <div className="relative w-full h-[60vh] max-w-full">
          <Image
            src={item.cover}
            alt=""
            fill
            sizes={IMAGE_SIZES}
            className="object-contain opacity-90"
            draggable={false}
          />
        </div>
      )}
      <audio src={item.src} controls className="w-80 max-w-full" />
    </div>
  )
}
