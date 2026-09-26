// src/components/instruments/sound-controls.tsx
//
// The small bottom-left cluster on pages with an instrument: a sound toggle,
// and (on the home page) a button that cycles the scale. The toggle wiggles
// when someone plays while muted, as a hint that sound is available.
'use client'

import { motion, useAnimate } from 'framer-motion'
import { useEffect } from 'react'
import { useSound } from '@/components/providers/sound'
import { SCALES, nextScale, type ScaleName } from './scales'

interface SoundControlsProps {
  visible?: boolean
  scale?: ScaleName
  onScaleChange?: (scale: ScaleName) => void
}

export default function SoundControls({ visible = true, scale, onScaleChange }: SoundControlsProps) {
  const { muted, toggleMuted, nudge } = useSound()
  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (nudge === 0 || !muted || !scope.current) return
    animate(scope.current, { x: [0, -4, 4, -3, 2, 0] }, { duration: 0.45 })
  }, [nudge, muted, animate, scope])

  return (
    <motion.div
      data-no-instrument
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
      transition={{ duration: 0.5, delay: visible ? 0.9 : 0 }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      className="fixed bottom-4 left-4 z-30 flex items-center gap-5 font-mono text-sm text-muted sm:bottom-6 sm:left-6"
    >
      <button
        ref={scope}
        type="button"
        onClick={toggleMuted}
        aria-pressed={!muted}
        className="flex items-center gap-2 transition-colors hover:text-foreground"
      >
        <SpeakerIcon muted={muted} />
        <span>{muted ? 'sound off' : 'sound on'}</span>
      </button>

      {scale && onScaleChange && (
        <button
          type="button"
          onClick={() => onScaleChange(nextScale(scale))}
          title="change scale"
          className="transition-colors hover:text-foreground"
        >
          <span aria-hidden>♪ </span>
          {SCALES[scale].label}
        </button>
      )}
    </motion.div>
  )
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <polygon points="3 9 7 9 11 5 11 19 7 15 3 15 3 9" />
      {muted ? (
        <>
          <line x1="16" y1="9" x2="22" y2="15" />
          <line x1="22" y1="9" x2="16" y2="15" />
        </>
      ) : (
        <>
          <path d="M15 9a5 5 0 0 1 0 6" />
          <path d="M18 6a9 9 0 0 1 0 12" />
        </>
      )}
    </svg>
  )
}
