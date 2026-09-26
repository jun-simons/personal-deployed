// src/components/instruments/theremin.tsx
//
// Press and drag inside the box: height sets pitch (on an exponential curve, so
// equal distances feel like equal intervals), horizontal position sets volume.
// Works with mouse, touch, and pen via pointer events + pointer capture.
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSound } from '@/components/providers/sound'

const MIN_HZ = 110
const MAX_HZ = 1100

type Voice = { ctx: AudioContext; osc: OscillatorNode; lfo: OscillatorNode; level: GainNode }
type Reading = { x: number; y: number; hz: number; volume: number }

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export default function Theremin() {
  const { muted, setMuted, getOutput } = useSound()
  const boxRef = useRef<HTMLDivElement>(null)
  const voiceRef = useRef<Voice | null>(null)
  const pressedRef = useRef(false)
  const [reading, setReading] = useState<Reading | null>(null)

  const read = (e: React.PointerEvent): Reading => {
    const rect = boxRef.current!.getBoundingClientRect()
    const x = clamp01((e.clientX - rect.left) / rect.width)
    const y = clamp01((e.clientY - rect.top) / rect.height)
    return {
      x,
      y,
      hz: MIN_HZ * Math.pow(MAX_HZ / MIN_HZ, 1 - y),
      volume: 0.03 + x * 0.2,
    }
  }

  const silence = useCallback(() => {
    const voice = voiceRef.current
    voiceRef.current = null
    if (!voice) return
    const t = voice.ctx.currentTime
    voice.level.gain.cancelScheduledValues(t)
    voice.level.gain.setTargetAtTime(0, t, 0.04)
    voice.osc.stop(t + 0.3)
    voice.lfo.stop(t + 0.3)
    voice.osc.onended = () => voice.level.disconnect()
  }, [])

  const release = useCallback(() => {
    pressedRef.current = false
    setReading(null)
    silence()
  }, [silence])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pressedRef.current = true
    const r = read(e)
    setReading(r)

    const output = getOutput()
    if (!output) return
    const { ctx, out } = output
    const t = ctx.currentTime

    const level = ctx.createGain()
    level.gain.setValueAtTime(0, t)
    level.gain.setTargetAtTime(r.volume, t, 0.03)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(r.hz, t)

    // a touch of vibrato, like a real player's hand
    const lfo = ctx.createOscillator()
    const depth = ctx.createGain()
    lfo.frequency.value = 5.5
    depth.gain.value = 4
    lfo.connect(depth)
    depth.connect(osc.frequency)

    osc.connect(level)
    level.connect(out)
    osc.start(t)
    lfo.start(t)
    voiceRef.current = { ctx, osc, lfo, level }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pressedRef.current) return
    const r = read(e)
    setReading(r)
    const voice = voiceRef.current
    if (!voice) return
    const t = voice.ctx.currentTime
    voice.osc.frequency.setTargetAtTime(r.hz, t, 0.02)
    voice.level.gain.setTargetAtTime(r.volume, t, 0.03)
  }

  useEffect(() => {
    if (muted) silence()
  }, [muted, silence])

  useEffect(() => silence, [silence])

  return (
    <div>
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        role="application"
        aria-label="Theremin. Press and drag: up raises the pitch, right raises the volume."
        className="relative h-56 w-full cursor-crosshair touch-none select-none overflow-hidden rounded-md border border-dashed border-rule sm:h-64"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0 31px, var(--grid-line) 31px 32px)',
        }}
      >
        {reading ? (
          <>
            <span
              className="pointer-events-none absolute inset-x-0 h-px bg-orange-500/40"
              style={{ top: `${reading.y * 100}%` }}
            />
            <span
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 shadow-[0_0_0_6px_rgb(249_115_22_/_0.18)]"
              style={{ left: `${reading.x * 100}%`, top: `${reading.y * 100}%` }}
            />
            <span className="pointer-events-none absolute right-3 top-2 font-mono text-xs tabular-nums text-muted">
              {Math.round(reading.hz)} hz
            </span>
          </>
        ) : (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-sm text-faint">
            press &amp; drag
          </span>
        )}
      </div>

      <p className="mt-3 font-mono text-sm text-muted">
        this box is a theremin: up for pitch, right for volume. sound is {muted ? 'off' : 'on'},{' '}
        <button
          type="button"
          onClick={() => setMuted(!muted)}
          aria-pressed={!muted}
          className="underline decoration-faint underline-offset-4 transition-colors hover:text-orange-500 hover:decoration-orange-500"
        >
          turn it {muted ? 'on' : 'off'}
        </button>
        .
      </p>
    </div>
  )
}
