// src/components/instruments/tuning-drawer.tsx
//
// The little panel behind the ⋯ on the home page: reverb, tail, sustain, and
// string spacing, plus the loop pedal's controls and a key legend.
'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, type MutableRefObject } from 'react'
import { useSound } from '@/components/providers/sound'
import type { LoopControls, LoopStatus } from './grid-instrument'

interface TuningDrawerProps {
  loop?: LoopStatus
  loopControls?: MutableRefObject<LoopControls | null>
}

const PEDAL_LABEL = {
  idle: 'record',
  recording: 'loop it',
  looping: 'overdub',
  overdub: 'done',
} as const

export default function TuningDrawer({ loop, loopControls }: TuningDrawerProps) {
  const { settings, updateSettings, resetSettings } = useSound()
  const [baseSpacing, setBaseSpacing] = useState(96)
  const mode = loop?.mode ?? 'idle'

  useEffect(() => {
    setBaseSpacing(window.innerWidth < 640 ? 64 : 96)
  }, [])

  const status =
    mode === 'idle'
      ? 'empty'
      : mode === 'recording'
        ? 'recording…'
        : mode === 'overdub'
          ? 'overdubbing…'
          : `looping ${((loop?.length ?? 0) / 1000).toFixed(1)}s`

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      role="dialog"
      aria-label="Tuning"
      className="absolute bottom-full left-0 mb-4 w-[min(19rem,calc(100vw-2rem))] rounded-md border border-rule bg-background p-4 text-xs leading-relaxed text-muted shadow-[0_10px_30px_rgb(0_0_0_/_0.06)]"
    >
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-foreground">tuning</p>
        <button type="button" onClick={resetSettings} className="transition-colors hover:text-foreground">
          reset
        </button>
      </div>

      <Knob
        label="reverb"
        value={settings.reverb}
        min={0}
        max={1}
        step={0.01}
        display={`${Math.round(settings.reverb * 100)}%`}
        onChange={(reverb) => updateSettings({ reverb })}
      />
      <Knob
        label="tail"
        value={settings.tail}
        min={0.4}
        max={6}
        step={0.1}
        display={`${settings.tail.toFixed(1)}s`}
        onChange={(tail) => updateSettings({ tail })}
      />
      <Knob
        label="sustain"
        value={settings.sustain}
        min={0.3}
        max={4}
        step={0.1}
        display={`${settings.sustain.toFixed(1)}s`}
        onChange={(sustain) => updateSettings({ sustain })}
      />
      <Knob
        label="spacing"
        value={settings.spacing}
        min={0.5}
        max={1.75}
        step={0.05}
        display={`${Math.round(baseSpacing * settings.spacing)}px`}
        onChange={(spacing) => updateSettings({ spacing })}
      />

      <div className="my-4 border-t border-rule" />

      <div className="flex items-baseline justify-between">
        <p className="text-foreground">loop pedal</p>
        <span className="tabular-nums">{status}</span>
      </div>
      <div className="mt-2 flex gap-4">
        <button
          type="button"
          onClick={() => loopControls?.current?.toggle()}
          className="flex items-center gap-1.5 text-foreground underline decoration-rule underline-offset-4 transition-colors hover:decoration-current"
        >
          {mode !== 'looping' && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
          {PEDAL_LABEL[mode]}
        </button>
        <button
          type="button"
          onClick={() => loopControls?.current?.clear()}
          disabled={mode === 'idle'}
          className="underline decoration-rule underline-offset-4 transition-colors enabled:hover:text-foreground disabled:opacity-40 disabled:no-underline"
        >
          clear
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-[3.25rem_1fr] gap-x-3 gap-y-1">
        <dt className="text-foreground">space</dt>
        <dd>record → loop → overdub</dd>
        <dt className="text-foreground">⌫</dt>
        <dd>clear the loop</dd>
        <dt className="text-foreground">a – &apos;</dt>
        <dd>play the strings</dd>
      </dl>
    </motion.div>
  )
}

interface KnobProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (value: number) => void
}

function Knob({ label, value, min, max, step, display, onChange }: KnobProps) {
  return (
    <label className="grid grid-cols-[3.75rem_1fr_2.75rem] items-center gap-3 py-0.5">
      <span>{label}</span>
      <input
        type="range"
        className="tuning-range w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="text-right tabular-nums text-foreground">{display}</span>
    </label>
  )
}
