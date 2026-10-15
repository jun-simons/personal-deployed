// src/components/art/piece-view.tsx
//
// An art piece's page: header (back link, title, year), the always-visible
// caption, and the slideshow. If the piece has an `about` write-up, the
// "(about)" button melts the artwork away (a turbulent SVG displacement while
// it stretches and drains downward), leaving a gallery wall text in its place:
// a column of details on the left, the write-up on the right, words coming
// into focus one by one. "(close)" lets the piece re-form. One write-up per
// piece, not per slide.
'use client'

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type Variants,
} from 'framer-motion'
import Link from 'next/link'
import { Fragment, useEffect, useId, useRef, useState } from 'react'
import type { Piece } from '@/app/art/pieces'
import Slideshow from './slideshow'

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const EASE_IN = [0.7, 0, 0.84, 0] as const

interface PieceViewProps {
  piece: Piece
  index: number // position in the /art list, for the "02 / 04" detail
  total: number
}

export default function PieceView({ piece, index, total }: PieceViewProps) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const mediaRef = useRef<HTMLDivElement>(null)
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null)
  const filterId = `melt-${useId().replace(/:/g, '')}`

  const paragraphs = (piece.about ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  // 0 = the piece, 1 = fully melted away
  const melt = useMotionValue(0)
  useEffect(() => {
    const controls = animate(
      melt,
      open ? 1 : 0,
      reduce
        ? { duration: 0.3 }
        : open
          ? { duration: 0.9, ease: EASE_IN }
          : { duration: 1, ease: EASE_OUT, delay: 0.2 } // let the text clear first
    )
    return () => controls.stop()
  }, [open, reduce, melt])

  // the displacement strength lives on an SVG attribute, so drive it directly
  useMotionValueEvent(melt, 'change', (v) => {
    displaceRef.current?.setAttribute('scale', String(v * 170))
  })

  // drains from the top down: a moving mask edge, a little stretch and drop
  const maskStop = useTransform(melt, [0, 1], [-35, 100])
  const mask = useTransform(maskStop, (s) => `linear-gradient(to bottom, transparent ${s}%, black ${s + 35}%)`)
  const y = useTransform(melt, [0, 1], [0, 70])
  const scaleY = useTransform(melt, [0, 1], [1, 1.14])
  const opacity = useTransform(melt, [0, 0.8, 1], [1, 1, 0])
  const filter = useTransform(melt, (v) =>
    v === 0 || reduce ? 'none' : `url(#${filterId}) blur(${(v * 5).toFixed(2)}px)`
  )

  useEffect(() => {
    if (!open) return
    mediaRef.current?.querySelectorAll('video, audio').forEach((m) => (m as HTMLMediaElement).pause())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.035" numOctaves={2} seed={7} result="noise" />
          <feDisplacementMap ref={displaceRef} in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <header className="flex flex-wrap items-baseline gap-x-8 gap-y-2 px-6 pb-4 font-mono sm:gap-x-10 sm:px-8">
        <Link href="/art" className="text-sm text-muted transition-colors hover:text-rose-400">
          ← all art
        </Link>
        <h1 className="font-display text-2xl tracking-wider sm:text-3xl">{piece.title}</h1>
        {piece.year && <span className="text-sm tabular-nums text-muted">{piece.year}</span>}

        {paragraphs.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="piece-about"
            className={`ml-auto text-sm tracking-wide transition-colors hover:text-rose-400 ${
              open ? 'text-rose-400' : 'text-muted'
            }`}
          >
            ({open ? 'close' : 'about'})
          </button>
        )}
      </header>

      {piece.description && (
        <p className="max-w-prose px-6 pb-4 font-mono text-sm leading-relaxed text-muted sm:px-8">
          {piece.description}
        </p>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col">
        <motion.div
          ref={mediaRef}
          inert={open}
          style={{
            y,
            scaleY,
            opacity,
            filter,
            WebkitMaskImage: mask,
            maskImage: mask,
            transformOrigin: '50% 0%',
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <Slideshow media={piece.media} />
        </motion.div>

        <AnimatePresence>
          {open && (
            <motion.section
              id="piece-about"
              key="about"
              aria-label={`About ${piece.title}`}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              className="absolute inset-0 overflow-y-auto px-6 pb-8 pt-2 sm:px-8 sm:pt-6"
            >
              <WallText piece={piece} paragraphs={paragraphs} index={index} total={total} reduce={!!reduce} />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

// ---- the wall text -----------------------------------------------------------

const detailsVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.75 } },
}

const detailVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  shown: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

function mediumOf(piece: Piece) {
  const count = (type: string) => piece.media.filter((m) => m.type === type).length
  const parts = [
    [count('image'), 'photograph'],
    [count('video'), 'video'],
    [count('audio'), 'recording'],
  ] as const
  return parts
    .filter(([n]) => n > 0)
    .map(([n, word]) => `${n} ${word}${n === 1 ? '' : 's'}`)
    .join(', ')
}

function WallText({
  piece,
  paragraphs,
  index,
  total,
  reduce,
}: {
  piece: Piece
  paragraphs: string[]
  index: number
  total: number
  reduce: boolean
}) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const details = [
    ['no.', `${pad(index + 1)} / ${pad(total)}`],
    ['year', piece.year],
    ['type', piece.tag],
    ['media', mediumOf(piece)],
  ].filter((d): d is [string, string] => Boolean(d[1]))

  const [lead, ...rest] = paragraphs
  const restDelay = 0.8 + lead.split(/\s+/).length * 0.014

  return (
    <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-[11rem_1fr] sm:gap-16">
      <motion.dl
        variants={detailsVariants}
        initial="hidden"
        animate="shown"
        className="grid grid-cols-2 gap-x-6 self-start font-mono text-xs sm:grid-cols-1"
      >
        {details.map(([label, value]) => (
          <motion.div key={label} variants={detailVariants} className="border-t border-rule py-2.5">
            <dt className="uppercase tracking-[0.18em] text-faint">{label}</dt>
            <dd className="mt-1 text-foreground">{value}</dd>
          </motion.div>
        ))}
      </motion.dl>

      <div className="max-w-2xl">
        <Words
          text={lead}
          delay={0.8}
          reduce={reduce}
          className="font-mono text-xl leading-snug text-foreground sm:text-2xl sm:leading-snug"
        />
        {rest.length > 0 && (
          <div className="mt-8 space-y-4 sm:mt-10">
            {rest.map((p, i) => (
              <Words
                key={i}
                text={p}
                delay={restDelay + i * 0.15}
                reduce={reduce}
                className="max-w-prose font-mono text-sm leading-relaxed text-muted sm:text-base sm:leading-relaxed"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Words drift up out of a blur, one after another.
function Words({ text, delay, reduce, className }: { text: string; delay: number; reduce: boolean; className: string }) {
  const words = text.split(/\s+/)
  if (reduce) {
    return (
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className={className}>
        {text}
      </motion.p>
    )
  }
  return (
    <p className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: '0.35em', filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: delay + i * 0.014, ease: EASE_OUT }}
          >
            {word}
          </motion.span>{' '}
        </Fragment>
      ))}
    </p>
  )
}
