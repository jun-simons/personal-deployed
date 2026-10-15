// src/components/art/piece-header.tsx
//
// The header strip on an art piece's page: back link, title, year, and, if
// the piece has a description, a small "about +" button that unfolds it
// beneath the header. One description per piece, not per slide.
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface PieceHeaderProps {
  title: string
  year?: string
  description?: string
}

export default function PieceHeader({ title, year, description }: PieceHeaderProps) {
  const [open, setOpen] = useState(false)
  const paragraphs = (description ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="flex flex-wrap items-baseline gap-x-8 gap-y-2 px-6 pb-4 font-mono sm:gap-x-10 sm:px-8">
        <Link href="/art" className="text-sm text-muted transition-colors hover:text-rose-400">
          ← all art
        </Link>
        <h1 className="font-display text-2xl tracking-wider sm:text-3xl">{title}</h1>
        {year && <span className="text-sm tabular-nums text-muted">{year}</span>}

        {paragraphs.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="piece-about"
            className={`ml-auto flex items-baseline gap-1.5 text-sm transition-colors hover:text-rose-400 ${
              open ? 'text-rose-400' : 'text-muted'
            }`}
          >
            about
            <span
              aria-hidden
              className={`inline-block transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
            >
              +
            </span>
          </button>
        )}
      </header>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="piece-about"
            key="about"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 overflow-hidden"
          >
            <div className="mx-6 mb-5 max-w-prose space-y-3 border-l border-rose-500/40 pl-4 font-mono text-sm leading-relaxed text-muted sm:mx-8">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
