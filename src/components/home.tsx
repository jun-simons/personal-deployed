// src/components/home.tsx
//
// The home page. On the first visit: the strings draw in from the center, the
// name rises in letter by letter, and a small hint appears. Any scroll, key,
// click, or tap (or a few seconds of waiting) sends the letters floating away,
// ripples the strings, and brings in the about text and the navbar. Coming
// back to "/" later in the same visit skips straight to the text.
'use client'

import { AnimatePresence, motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import GridInstrument, { type LoopControls, type LoopStatus } from '@/components/instruments/grid-instrument'
import SoundControls from '@/components/instruments/sound-controls'
import { useIntro } from '@/components/providers/intro'

const NAME = 'Jun Simons'
const HINT_DELAY_MS = 1800
const AUTO_REVEAL_MS = 4800
const REVEAL_KEYS = new Set(['ArrowDown', 'PageDown', ' ', 'Enter'])

const ease = [0.22, 1, 0.36, 1] as const

const nameVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  gone: { transition: { staggerChildren: 0.03 } },
}

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  shown: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 20 } },
  gone: { opacity: 0, y: -48, transition: { duration: 0.4, ease: 'easeIn' } },
}

const aboutVariants: Variants = {
  hidden: {},
  shown: (skippedIntro: boolean) => ({
    transition: { staggerChildren: 0.12, delayChildren: skippedIntro ? 0.05 : 0.55 },
  }),
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

const inlineLink =
  'underline decoration-neutral-400 decoration-1 underline-offset-4 transition-colors'

export default function Home() {
  const { introDone, finishIntro } = useIntro()

  // decided once, on mount: did the intro already play during this visit?
  const [skippedIntro] = useState(introDone)
  const [phase, setPhase] = useState<'intro' | 'revealed'>(introDone ? 'revealed' : 'intro')
  const [fontsReady, setFontsReady] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hint, setHint] = useState('scroll')
  const [rippleKey, setRippleKey] = useState(0)
  const [loop, setLoop] = useState<LoopStatus>({ mode: 'idle', length: 0 })
  const loopControls = useRef<LoopControls | null>(null)
  const revealedRef = useRef(introDone)

  const reveal = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    setPhase('revealed')
    setRippleKey((k) => k + 1)
    finishIntro()
  }, [finishIntro])

  // Returning visits get a small ripple hello instead of the full intro.
  useEffect(() => {
    if (!skippedIntro) return
    const t = setTimeout(() => setRippleKey((k) => k + 1), 150)
    return () => clearTimeout(t)
  }, [skippedIntro])

  // Start the name once the display font is in (capped, so a slow font
  // never holds the page hostage). Reduced-motion users skip the intro.
  useEffect(() => {
    if (phase !== 'intro') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal()
      return
    }
    if (window.matchMedia('(pointer: coarse)').matches) setHint('tap anywhere')

    let cancelled = false
    const go = () => {
      if (!cancelled) setFontsReady(true)
    }
    const cap = setTimeout(go, 900)
    document.fonts?.ready.then(go)
    return () => {
      cancelled = true
      clearTimeout(cap)
    }
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Anything that looks like "go on" ends the intro.
  useEffect(() => {
    if (phase !== 'intro') return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 2) reveal()
    }
    const onKey = (e: KeyboardEvent) => {
      if (REVEAL_KEYS.has(e.key)) reveal()
    }
    const hintTimer = setTimeout(() => setShowHint(true), HINT_DELAY_MS)
    const autoTimer = setTimeout(reveal, AUTO_REVEAL_MS)
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', reveal)
    window.addEventListener('touchstart', reveal, { passive: true })
    return () => {
      clearTimeout(hintTimer)
      clearTimeout(autoTimer)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', reveal)
      window.removeEventListener('touchstart', reveal)
    }
  }, [phase, reveal])

  const revealed = phase === 'revealed'

  return (
    <div className="relative">
      <GridInstrument
        drawIn={!skippedIntro}
        rippleKey={rippleKey}
        ready={revealed}
        loopControlsRef={loopControls}
        onLoopChange={setLoop}
      />

      <h1 className="sr-only">{NAME}</h1>

      <AnimatePresence>
        {!revealed && (
          <motion.div
            key="intro"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center"
            exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.35 } }}
          >
            <motion.div
              className="flex font-display text-[13vw] tracking-widest sm:text-[12vw] md:text-[10vw] lg:text-[7rem]"
              variants={nameVariants}
              initial="hidden"
              animate={fontsReady ? 'shown' : 'hidden'}
              exit="gone"
            >
              {[...NAME].map((char, i) => (
                <motion.span key={i} variants={letterVariants} className="inline-block">
                  {char === ' ' ? ' ' : char}
                </motion.span>
              ))}
            </motion.div>

            <motion.p
              className="absolute bottom-10 font-mono text-sm tracking-wide text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: showHint ? 1 : 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                className="inline-block"
                animate={showHint ? { y: [0, 3, 0] } : undefined}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                {hint} ↓
              </motion.span>
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        className={`relative z-10 mx-auto flex min-h-[100svh] max-w-[48rem] flex-col items-center justify-center px-6 pb-24 pt-28 text-center sm:px-8 ${
          revealed ? '' : 'pointer-events-none'
        }`}
        variants={aboutVariants}
        custom={skippedIntro}
        initial="hidden"
        animate={revealed ? 'shown' : 'hidden'}
      >
        <div className="space-y-6 font-mono text-[1.05rem] leading-relaxed text-neutral-700 sm:text-xl sm:leading-relaxed">
          <motion.p variants={itemVariants}>
            I&rsquo;m a CS masters student at RPI and I also work at&nbsp;
            <a
              href="https://www.ll.mit.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${inlineLink} hover:text-blue-600 hover:decoration-blue-600`}
            >
              MIT Lincoln Laboratory.
            </a>{' '}
            Im currently building foundation models for RF signals and using ML for quantum compilers.
          </motion.p>
          <motion.p variants={itemVariants}>
            In addition to ML, im interested in distributed systems and open source software. I
            previously did a co-op at&nbsp;
            <a
              href="https://innovativemedicine.jnj.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${inlineLink} hover:text-red-600 hover:decoration-red-600`}
            >
              J&amp;J
            </a>{' '}
            with their advanced computing team.
          </motion.p>
          <motion.p variants={itemVariants}>
            In my free time, I often play music, make art, and dance. I&rsquo;m interested in the
            art-technology intersection.
          </motion.p>
        </div>

        <motion.div variants={itemVariants} className="mt-14">
          <Link
            href="/blog"
            className="font-mono text-base text-muted underline-offset-4 transition-colors hover:text-green-700 hover:underline sm:text-lg"
          >
            explore my projects →
          </Link>
        </motion.div>
      </motion.main>

      <SoundControls visible={revealed} loop={loop} loopControls={loopControls} />
    </div>
  )
}
