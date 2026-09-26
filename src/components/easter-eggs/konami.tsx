// src/components/easter-eggs/konami.tsx
//
// ↑ ↑ ↓ ↓ ← → ← → B A, anywhere on the site. Broadcasts a `site:konami` window
// event (the home strings go rainbow, the owl pops up), plays a flourish up
// the current scale, and shows a small note under the navbar.
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { frequencyFor } from '@/components/instruments/scales'
import { useSound } from '@/components/providers/sound'

const SEQUENCE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
]

const FLOURISH_STEPS = 11

export default function Konami() {
  const { playNote, settings } = useSound()
  const live = useRef({ playNote, settings })
  const [shown, setShown] = useState(false)

  useEffect(() => {
    live.current = { playNote, settings }
  })

  useEffect(() => {
    let progress = 0
    let hideTimer = 0

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === SEQUENCE[progress]) progress += 1
      else if (key === 'arrowup') progress = progress === 2 ? 2 : 1 // ↑↑↑ still counts
      else progress = 0
      if (progress < SEQUENCE.length) return
      progress = 0

      window.dispatchEvent(new Event('site:konami'))
      const { playNote, settings } = live.current
      for (let step = 0; step < FLOURISH_STEPS; step++) {
        playNote(frequencyFor(settings.scale, step), { strength: 0.55, delay: step * 0.065 })
      }
      setShown(true)
      window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => setShown(false), 2600)
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(hideTimer)
    }
  }, [])

  return (
    <AnimatePresence>
      {shown && (
        <motion.p
          role="status"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 top-20 z-50 text-center font-mono text-sm text-muted sm:top-24"
        >
          ✦ cheat code accepted ✦
        </motion.p>
      )}
    </AnimatePresence>
  )
}
