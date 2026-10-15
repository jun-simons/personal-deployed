// src/components/art/piece-view.tsx
//
// An art piece's page: header (back link, title, year), the always-visible
// caption, and the slideshow. If the piece has an `about` write-up, an
// "about ↻" button turns the artwork over: the media flips around in 3D, and
// on its back is a paper gallery label, taped on slightly askew, with the
// write-up printed on it. One write-up per piece, not per slide.
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Piece } from '@/app/art/pieces'
import Slideshow from './slideshow'

const FLIP = { duration: 0.8, ease: [0.65, 0, 0.35, 1] } as const

export default function PieceView({ piece }: { piece: Piece }) {
  const [flipped, setFlipped] = useState(false)
  const reduce = useReducedMotion()
  const frontRef = useRef<HTMLDivElement>(null)

  const paragraphs = (piece.about ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  // turning the piece over pauses anything playing on the front
  useEffect(() => {
    if (!flipped) return
    frontRef.current?.querySelectorAll('video, audio').forEach((m) => (m as HTMLMediaElement).pause())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFlipped(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipped])

  // reduced motion: cross-fade the two sides instead of flipping
  const sideFade = (visible: boolean) =>
    reduce ? `transition-opacity duration-300 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}` : ''

  return (
    <>
      <header className="flex flex-wrap items-baseline gap-x-8 gap-y-2 px-6 pb-4 font-mono sm:gap-x-10 sm:px-8">
        <Link href="/art" className="text-sm text-muted transition-colors hover:text-rose-400">
          ← all art
        </Link>
        <h1 className="font-display text-2xl tracking-wider sm:text-3xl">{piece.title}</h1>
        {piece.year && <span className="text-sm tabular-nums text-muted">{piece.year}</span>}

        {paragraphs.length > 0 && (
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-pressed={flipped}
            className={`ml-auto flex items-baseline gap-1.5 text-sm transition-colors hover:text-rose-400 ${
              flipped ? 'text-rose-400' : 'text-muted'
            }`}
          >
            {flipped ? 'turn back' : 'about'}
            <motion.span
              aria-hidden
              className="inline-block"
              animate={{ rotate: flipped ? -180 : 0 }}
              transition={FLIP}
            >
              ↻
            </motion.span>
          </button>
        )}
      </header>

      {piece.description && (
        <p className="max-w-prose px-6 pb-4 font-mono text-sm leading-relaxed text-muted sm:px-8">
          {piece.description}
        </p>
      )}

      <div className="relative min-h-0 flex-1 [perspective:1800px]">
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          initial={false}
          animate={reduce ? undefined : { rotateY: flipped ? 180 : 0 }}
          transition={FLIP}
        >
          {/* front: the artwork */}
          <div
            ref={frontRef}
            inert={flipped}
            className={`absolute inset-0 flex flex-col [backface-visibility:hidden] ${sideFade(!flipped)}`}
          >
            <Slideshow media={piece.media} />
          </div>

          {/* back: the label */}
          {paragraphs.length > 0 && (
            <div
              inert={!flipped}
              onClick={(e) => {
                if (e.target === e.currentTarget) setFlipped(false) // click the bare back to turn it over
              }}
              className={`absolute inset-0 mx-6 mb-2 flex flex-col overflow-y-auto rounded-sm border border-dashed border-rule p-6 [backface-visibility:hidden] sm:mx-8 sm:p-10 ${
                reduce ? sideFade(flipped) : '[transform:rotateY(180deg)]'
              }`}
            >
              <Label piece={piece} paragraphs={paragraphs} onTurnBack={() => setFlipped(false)} />
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}

function Label({
  piece,
  paragraphs,
  onTurnBack,
}: {
  piece: Piece
  paragraphs: string[]
  onTurnBack: () => void
}) {
  const meta = [piece.year, piece.tag].filter(Boolean).join(' · ')
  return (
    <div className="relative m-auto w-full max-w-xl -rotate-1 bg-[#ecebe7] px-6 py-7 text-[#1f1f1f] shadow-[0_14px_40px_rgb(0_0_0_/_0.45)] sm:px-9 sm:py-9">
      {/* two strips of tape holding the label on */}
      <span aria-hidden className="absolute -top-3 left-6 h-6 w-20 -rotate-6 bg-white/35 backdrop-blur-[1px]" />
      <span aria-hidden className="absolute -top-3 right-6 h-6 w-20 rotate-[5deg] bg-white/35 backdrop-blur-[1px]" />

      <h2 className="font-display text-3xl tracking-wider">{piece.title}</h2>
      {meta && <p className="mt-1 font-mono text-xs tracking-wide text-[#6b6862]">{meta}</p>}

      <div className="my-5 border-t border-[#1f1f1f]/15" />

      <div className="space-y-4 font-mono text-sm leading-relaxed text-[#2b2a28]">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <button
        type="button"
        onClick={onTurnBack}
        className="mt-7 font-mono text-xs text-[#6b6862] transition-colors hover:text-rose-600"
      >
        ↺ turn it back over
      </button>
    </div>
  )
}
