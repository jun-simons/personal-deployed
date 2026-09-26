// src/components/instruments/sound-controls.tsx
//
// The small bottom-left cluster on the home page: sound toggle, scale, voice,
// a loop indicator while the pedal is in use, and a faint ⋯ that opens the
// tuning drawer. The sound toggle wiggles when someone plays while muted.
'use client'

import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { useSound } from '@/components/providers/sound'
import type { LoopControls, LoopStatus } from './grid-instrument'
import { NOTE_NAMES, SCALES, nextScale } from './scales'
import TuningDrawer from './tuning-drawer'
import { VOICES, nextVoice } from './voices'

interface SoundControlsProps {
  visible?: boolean
  loop?: LoopStatus
  loopControls?: MutableRefObject<LoopControls | null>
}

export default function SoundControls({ visible = true, loop, loopControls }: SoundControlsProps) {
  const { muted, toggleMuted, nudge, settings, updateSettings } = useSound()
  const [scope, animate] = useAnimate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const clusterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (nudge === 0 || !muted || !scope.current) return
    animate(scope.current, { x: [0, -4, 4, -3, 2, 0] }, { duration: 0.45 })
  }, [nudge, muted, animate, scope])

  // close the drawer on Escape or a click anywhere else
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    const onDown = (e: PointerEvent) => {
      if (!clusterRef.current?.contains(e.target as Node)) setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [drawerOpen])

  const mode = loop?.mode ?? 'idle'

  return (
    <motion.div
      ref={clusterRef}
      data-no-instrument
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
      transition={{ duration: 0.5, delay: visible ? 0.9 : 0 }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      className="fixed bottom-4 left-4 z-30 font-mono text-[13px] text-muted sm:bottom-6 sm:left-6 sm:text-sm"
    >
      <AnimatePresence>
        {drawerOpen && <TuningDrawer loop={loop} loopControls={loopControls} />}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5">
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

        <button
          type="button"
          onClick={() => updateSettings({ scale: nextScale(settings.scale) })}
          title="change scale"
          className="transition-colors hover:text-foreground"
        >
          <span aria-hidden>♪ </span>
          {NOTE_NAMES[settings.root]} {SCALES[settings.scale].label}
        </button>

        <button
          type="button"
          onClick={() => updateSettings({ voice: nextVoice(settings.voice) })}
          title="change voice"
          className="transition-colors hover:text-foreground"
        >
          <span aria-hidden>~ </span>
          {VOICES[settings.voice].label}
        </button>

        {mode !== 'idle' && (
          <button
            type="button"
            onClick={() => loopControls?.current?.toggle()}
            title="loop pedal (space)"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            {mode === 'looping' ? (
              <span aria-hidden>↻</span>
            ) : (
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
            )}
            {mode === 'recording' ? 'rec' : mode === 'overdub' ? 'dub' : 'loop'}
          </button>
        )}

        <button
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
          aria-expanded={drawerOpen}
          aria-label="tuning"
          title="tuning"
          className={`px-1 tracking-widest transition-opacity hover:text-foreground hover:opacity-100 ${
            drawerOpen ? 'text-foreground opacity-100' : 'opacity-40'
          }`}
        >
          ⋯
        </button>
      </div>
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
