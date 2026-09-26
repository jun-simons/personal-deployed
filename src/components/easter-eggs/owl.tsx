// src/components/easter-eggs/owl.tsx
//
// The site owl (same line-art owl as the favicon). Its eyes follow the pointer
// and it blinks now and then. <IdleOwl /> peeks up from the bottom-right corner
// after a while of no activity, or when the Konami code is entered; clicking it
// makes it hoot. <PerchedOwl /> is a clickable owl that just sits there (404).
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSound } from '@/components/providers/sound'

const IDLE_MS = 45_000
const PEEK_MS = 14_000
const COOLDOWN_MS = 120_000

export function OwlFigure({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const eyesRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current
      const eyes = eyesRef.current
      if (!svg || !eyes) return
      const r = svg.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height * 0.3)
      const dist = Math.hypot(dx, dy) || 1
      const reach = Math.min(1, dist / 300) * 16 // in svg units
      eyes.setAttribute('transform', `translate(${(dx / dist) * reach} ${(dy / dist) * reach})`)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth={28}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* body, filled so anything behind it is hidden */}
      <path
        d="M440 470V200C440 95 360 32 256 32C152 32 72 100 72 200V250C72 380 170 470 300 470H440Z"
        fill="var(--background)"
      />
      {/* facial disc */}
      <path d="M82 256C118 316 184 346 256 346C330 346 396 312 436 250" />
      <path d="M124 58C178 66 238 92 256 122C274 92 334 66 388 56" />
      {/* beak */}
      <path d="M256 122V192" />
      {/* wing */}
      <path d="M348 336C346 400 372 448 424 470" />
      <g ref={eyesRef}>
        <g className="owl-eyes">
          <circle cx="158" cy="152" r="24" fill="currentColor" stroke="none" />
          <circle cx="354" cy="152" r="24" fill="currentColor" stroke="none" />
        </g>
      </g>
    </svg>
  )
}

/** Two soft, falling "hoo"s. Silent (returns false) while sound is off. */
export function useHoot() {
  const { getOutput } = useSound()
  return useCallback(() => {
    const output = getOutput()
    if (!output) return false
    const { ctx, out } = output
    const hoo = (start: number, from: number, to: number, length: number) => {
      const osc = ctx.createOscillator()
      osc.frequency.setValueAtTime(from, start)
      osc.frequency.exponentialRampToValueAtTime(to, start + length)
      const env = ctx.createGain()
      env.gain.setValueAtTime(0.0001, start)
      env.gain.exponentialRampToValueAtTime(0.2, start + 0.08)
      env.gain.exponentialRampToValueAtTime(0.0001, start + length)
      osc.connect(env)
      env.connect(out)
      osc.start(start)
      osc.stop(start + length + 0.05)
      osc.onended = () => env.disconnect()
    }
    const t = ctx.currentTime
    hoo(t, 380, 330, 0.32)
    hoo(t + 0.42, 360, 290, 0.6)
    return true
  }, [getOutput])
}

function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const timer = useRef(0)
  const speak = useCallback(() => {
    setSpeaking(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setSpeaking(false), 1700)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return [speaking, speak] as const
}

function Speech({ show, className }: { show: boolean; className: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`pointer-events-none absolute whitespace-nowrap font-mono text-xs text-muted ${className}`}
        >
          hoo hoo
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export function PerchedOwl() {
  const hoot = useHoot()
  const [speaking, speak] = useSpeech()
  return (
    <button
      type="button"
      aria-label="an owl. click it"
      onClick={() => {
        hoot()
        speak()
      }}
      className="relative text-foreground"
    >
      <OwlFigure className="h-16 w-16 sm:h-20 sm:w-20" />
      <Speech show={speaking} className="-right-4 -top-4 translate-x-full" />
    </button>
  )
}

export default function IdleOwl() {
  const [visible, setVisible] = useState(false)
  const [speaking, speak] = useSpeech()
  const hoot = useHoot()
  const visibleRef = useRef(false)
  const lastActivity = useRef(0)
  const lastShown = useRef(-Infinity)
  const hideTimer = useRef(0)
  const hootRef = useRef(hoot)

  useEffect(() => {
    hootRef.current = hoot
  }, [hoot])

  const hide = useCallback(() => {
    visibleRef.current = false
    setVisible(false)
  }, [])

  const appear = useCallback(
    (stayFor = PEEK_MS) => {
      visibleRef.current = true
      lastShown.current = Date.now()
      setVisible(true)
      window.clearTimeout(hideTimer.current)
      hideTimer.current = window.setTimeout(hide, stayFor)
    },
    [hide]
  )

  useEffect(() => {
    lastActivity.current = Date.now()
    const bump = () => {
      lastActivity.current = Date.now()
    }
    const events = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach((ev) => window.addEventListener(ev, bump, { passive: true }))

    const tick = window.setInterval(() => {
      const now = Date.now()
      if (
        !visibleRef.current &&
        document.visibilityState === 'visible' &&
        now - lastActivity.current > IDLE_MS &&
        now - lastShown.current > COOLDOWN_MS
      ) {
        appear()
      }
    }, 2000)

    const onKonami = () => {
      appear()
      window.setTimeout(() => {
        hootRef.current()
        speak()
      }, 500)
    }
    window.addEventListener('site:konami', onKonami)

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, bump))
      window.clearInterval(tick)
      window.clearTimeout(hideTimer.current)
      window.removeEventListener('site:konami', onKonami)
    }
  }, [appear, speak])

  return (
    <motion.div
      data-no-instrument
      initial={false}
      animate={{ y: visible ? '38%' : '115%' }}
      transition={{ type: 'spring', stiffness: 170, damping: 17 }}
      className="pointer-events-none fixed bottom-0 right-6 z-30 sm:right-12"
    >
      <Speech show={speaking && visible} className="-top-5 right-full mr-1" />
      <button
        type="button"
        aria-label="an owl. click it"
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        onClick={() => {
          hoot()
          speak()
          appear(2600) // say hi, then duck back down
        }}
        className="pointer-events-auto block text-foreground"
      >
        <OwlFigure className="h-14 w-14 sm:h-16 sm:w-16" />
      </button>
    </motion.div>
  )
}
