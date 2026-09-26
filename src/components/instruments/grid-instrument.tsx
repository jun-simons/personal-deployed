// src/components/instruments/grid-instrument.tsx
//
// The home page background: a row of vertical strings.
//   - hover glows, click/tap plucks, dragging across strings strums
//   - the home row keys (a s d f g h j k l ; ') play the strings, h is center
//   - a loop pedal: space records, space again loops it, space again overdubs;
//     backspace clears
// Everything is drawn on one canvas, and the animation loop only runs while
// something is moving. Notes go through the shared sound provider, so they use
// whatever voice/scale/tuning is currently set.
'use client'

import { useEffect, useRef, type MutableRefObject } from 'react'
import { useSound } from '@/components/providers/sound'
import { frequencyFor } from './scales'

export type LoopMode = 'idle' | 'recording' | 'looping' | 'overdub'
export type LoopStatus = { mode: LoopMode; length: number }
export type LoopControls = { toggle: () => void; clear: () => void }

interface GridInstrumentProps {
  /** Grow the strings in from the center on mount (first-visit intro). */
  drawIn: boolean
  /** Increment to send a ripple across the strings (visual only). */
  rippleKey: number
  /** The keyboard and loop pedal only respond once this is true. */
  ready: boolean
  loopControlsRef?: MutableRefObject<LoopControls | null>
  onLoopChange?: (status: LoopStatus) => void
}

type Str = {
  k: number // index from the center string; also picks the note
  x: number
  hover: number // eased 0..1
  pluckAt: number // performance.now() when the latest pluck starts
  pluckStrength: number // 0..1, 0 once it has rung out
  pluckY: number // where along the string it was plucked
  dir: 1 | -1 // which way it first swings
}

type LoopEvent = { t: number; k: number; strength: number }

// Clicks on these shouldn't also pluck a string underneath them.
const INTERACTIVE = 'a,button,input,select,textarea,label,summary,[data-no-instrument]'
// Pressing on text plucks once but doesn't strum, so text stays selectable.
const TEXT = 'p,li,h1,h2,h3,h4,dd,dt,blockquote,pre,code'
// Home row, left to right; 'h' (index 5) is the center string.
const KEY_ROW = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"]
const KEY_CENTER = 5

const DRAW_IN_MS = 800
const DRAW_IN_STAGGER_MS = 70
const WOBBLE_HZ = 6
const MAX_SWING_PX = 7
const LOOKAHEAD_MS = 150
const MIN_LOOP_MS = 250

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const hueFor = (k: number) => (((k * 32) % 360) + 360) % 360

export default function GridInstrument({
  drawIn,
  rippleKey,
  ready,
  loopControlsRef,
  onLoopChange,
}: GridInstrumentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { settings, playNote, requestNudge } = useSound()

  // the canvas effect runs once; it reads current values through this ref
  const live = useRef({ settings, playNote, requestNudge, ready, onLoopChange })
  useEffect(() => {
    live.current = { settings, playNote, requestNudge, ready, onLoopChange }
  })

  const drawInRef = useRef(drawIn)
  const rippleRef = useRef<() => void>(() => {})
  const relayoutRef = useRef<() => void>(() => {})

  useEffect(() => {
    const canvasEl = canvasRef.current
    const context = canvasEl?.getContext('2d')
    if (!canvasEl || !context) return
    const canvas: HTMLCanvasElement = canvasEl
    const g: CanvasRenderingContext2D = context

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const introStart = drawInRef.current && !reduced ? performance.now() + 120 : -Infinity
    const timers = new Set<number>()

    let w = 0
    let h = 0
    let strings: Str[] = []
    let lineColor = '#cfccc8'
    let accentColor = '#8fa38b'
    let rainbow = false
    let hoverX: number | null = null
    let dragX: number | null = null
    let raf = 0

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        fn()
      }, ms)
      timers.add(id)
    }

    // ---- layout & drawing -------------------------------------------------

    function layout() {
      w = canvas.clientWidth
      h = canvas.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)

      const base = w < 640 ? 64 : 96
      const spacing = Math.max(28, Math.round(base * live.current.settings.spacing))
      const cx = Math.round(w / 2)
      const reach = Math.ceil(cx / spacing)
      const previous = new Map(strings.map((s) => [s.k, s]))
      strings = []
      for (let k = -reach; k <= reach; k++) {
        const x = cx + k * spacing
        const old = previous.get(k)
        strings.push(
          old
            ? { ...old, x }
            : { k, x, hover: 0, pluckAt: 0, pluckStrength: 0, pluckY: h / 2, dir: 1 }
        )
      }

      const css = getComputedStyle(document.documentElement)
      lineColor = css.getPropertyValue('--grid-line').trim() || lineColor
      accentColor = css.getPropertyValue('--grid-accent').trim() || accentColor
      kick()
    }
    relayoutRef.current = layout

    function nearest(x: number) {
      let best: Str | null = null
      let bestDist = Infinity
      for (const s of strings) {
        const d = Math.abs(s.x - x)
        if (d < bestDist) {
          best = s
          bestDist = d
        }
      }
      return best
    }

    function stroke(x: number, top: number, bottom: number, bendY: number, swing: number, color: string, width: number) {
      g.beginPath()
      g.moveTo(x, top)
      if (Math.abs(swing) < 0.05) {
        g.lineTo(x, bottom)
      } else {
        // a quadratic's control point sits at twice the curve's peak offset
        g.quadraticCurveTo(x + 2 * swing, bendY, x, bottom)
      }
      g.strokeStyle = color
      g.lineWidth = width
      g.stroke()
    }

    function frame(now: number) {
      raf = 0
      g.clearRect(0, 0, w, h)
      const hovered = hoverX === null ? null : nearest(hoverX)
      const ringSeconds = 0.25 + live.current.settings.sustain * 0.2
      let busy = false

      for (const s of strings) {
        // draw-in: the center string first, each one growing out from the middle
        let grow = 1
        const sinceStart = now - introStart - Math.abs(s.k) * DRAW_IN_STAGGER_MS
        if (sinceStart < DRAW_IN_MS) {
          busy = true
          if (sinceStart <= 0) continue
          grow = easeOutCubic(sinceStart / DRAW_IN_MS)
        }

        const target = s === hovered ? 1 : 0
        s.hover += (target - s.hover) * 0.2
        if (Math.abs(target - s.hover) < 0.01) s.hover = target
        else busy = true

        let swing = 0
        let ring = 0
        if (s.pluckStrength > 0) {
          busy = true
          const t = (now - s.pluckAt) / 1000
          if (t > 0) {
            ring = s.pluckStrength * Math.exp(-t / ringSeconds)
            if (ring < 0.01) {
              s.pluckStrength = 0
              ring = 0
            } else if (!reduced) {
              swing = s.dir * MAX_SWING_PX * ring * Math.cos(2 * Math.PI * WOBBLE_HZ * t)
            }
          }
        }

        const half = (h / 2) * grow
        const top = h / 2 - half
        const bottom = h / 2 + half
        const x = s.x + 0.5 // crisp 1px lines
        const bendY = clamp(s.pluckY, top + (bottom - top) * 0.15, bottom - (bottom - top) * 0.15)
        const hue = hueFor(s.k)

        stroke(x, top, bottom, bendY, swing, rainbow ? `hsl(${hue} 45% 74%)` : lineColor, 1)
        const glow = Math.max(s.hover, ring)
        if (glow > 0.01) {
          g.globalAlpha = glow
          stroke(x, top, bottom, bendY, swing, rainbow ? `hsl(${hue} 75% 52%)` : accentColor, 1 + 1.75 * glow)
          g.globalAlpha = 1
        }
      }

      if (busy) kick()
    }

    // ---- playing ------------------------------------------------------------

    function pluckVisual(s: Str, y: number, strength: number, dir: 1 | -1, delayMs = 0) {
      s.pluckAt = performance.now() + delayMs
      s.pluckStrength = Math.min(1, strength)
      s.pluckY = y
      s.dir = dir
      kick()
    }

    function sound(k: number, strength: number, delayMs: number, nudgeIfMuted: boolean) {
      const { settings, playNote, requestNudge } = live.current
      const hz = frequencyFor(settings.scale, k, settings.root)
      const played = playNote(hz, { strength, delay: delayMs / 1000 })
      if (!played && nudgeIfMuted) requestNudge()
    }

    // a note played by the visitor: pluck it, sound it, and record it if the pedal is down
    function strike(k: number, y: number, strength: number, dir: 1 | -1) {
      const s = strings.find((str) => str.k === k)
      if (s) pluckVisual(s, y, strength, dir)
      sound(k, strength, 0, true)
      record(k, strength)
    }

    rippleRef.current = () => {
      const reach = strings.length / 2 + 1
      for (const s of strings) {
        const falloff = 1 - Math.min(Math.abs(s.k) / reach, 0.8)
        pluckVisual(s, h / 2, 0.55 * falloff, s.k % 2 ? 1 : -1, Math.abs(s.k) * 45)
      }
    }

    // ---- loop pedal ---------------------------------------------------------

    let mode: LoopMode = 'idle'
    let recStart = 0
    let loopStart = 0
    let loopLength = 0
    let events: LoopEvent[] = []
    let scheduledUntil = 0
    let scheduler = 0

    const report = () => live.current.onLoopChange?.({ mode, length: loopLength })

    function record(k: number, strength: number) {
      const now = performance.now()
      if (mode === 'recording') events.push({ t: now - recStart, k, strength })
      else if (mode === 'overdub') events.push({ t: (now - loopStart) % loopLength, k, strength })
    }

    // Schedule every loop note that falls in the next LOOKAHEAD_MS. Audio is
    // timed on the AudioContext clock; the visual pluck on a timer.
    function schedule() {
      if (!loopLength) return
      const now = performance.now()
      const until = now + LOOKAHEAD_MS
      for (const ev of events) {
        const first = loopStart + ev.t
        const skip = Math.max(0, Math.ceil((scheduledUntil - first) / loopLength))
        for (let at = first + skip * loopLength; at < until; at += loopLength) {
          const delay = Math.max(0, at - now)
          const strength = ev.strength * 0.9
          sound(ev.k, strength, delay, false)
          later(() => {
            const s = strings.find((str) => str.k === ev.k)
            if (s) pluckVisual(s, h / 2, strength, ev.k % 2 ? 1 : -1)
          }, delay)
        }
      }
      scheduledUntil = until
    }

    function stopScheduler() {
      window.clearInterval(scheduler)
      scheduler = 0
    }

    function toggleLoop() {
      const now = performance.now()
      if (mode === 'idle') {
        mode = 'recording'
        recStart = now
        events = []
        loopLength = 0
      } else if (mode === 'recording') {
        const length = now - recStart
        if (events.length === 0 || length < MIN_LOOP_MS) {
          mode = 'idle'
          events = []
        } else {
          // the loop's first pass is what was just played, so the next pass
          // starts right now
          mode = 'looping'
          loopLength = length
          loopStart = recStart
          scheduledUntil = now
          stopScheduler()
          schedule()
          scheduler = window.setInterval(schedule, 40)
        }
      } else if (mode === 'looping') {
        mode = 'overdub'
      } else {
        mode = 'looping'
      }
      report()
    }

    function clearLoop() {
      mode = 'idle'
      events = []
      loopLength = 0
      stopScheduler()
      report()
    }

    if (loopControlsRef) loopControlsRef.current = { toggle: toggleLoop, clear: clearLoop }

    // ---- input --------------------------------------------------------------

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === 'mouse') {
        hoverX = e.clientX
        kick()
      }
      if (dragX === null) return
      // strum every string crossed since the last move
      const lo = Math.min(dragX, e.clientX)
      const hi = Math.max(dragX, e.clientX)
      const dir = e.clientX > dragX ? 1 : -1
      for (const s of strings) {
        if (s.x > lo && s.x <= hi) strike(s.k, e.clientY, 0.75, dir)
      }
      dragX = e.clientX
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest(INTERACTIVE)) return
      const s = nearest(e.clientX)
      if (s) strike(s.k, e.clientY, 1, e.clientX < s.x ? 1 : -1)
      if (target?.closest(TEXT)) return
      // starting on empty space: strum, and don't sweep a text selection along
      dragX = e.clientX
      document.documentElement.style.userSelect = 'none'
    }

    const release = () => {
      dragX = null
      document.documentElement.style.userSelect = ''
    }

    function onMouseOut(e: MouseEvent) {
      if (!e.relatedTarget) {
        hoverX = null
        kick()
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!live.current.ready || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest('input,textarea,select,[contenteditable="true"]')) return

      if (e.key === ' ') {
        if (target?.closest('button,a,summary')) return // let focused controls handle space
        e.preventDefault()
        if (!e.repeat) toggleLoop()
        return
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (mode !== 'idle') {
          e.preventDefault()
          clearLoop()
        }
        return
      }
      if (e.repeat) return
      const i = KEY_ROW.indexOf(e.key.toLowerCase())
      if (i === -1) return
      const k = i - KEY_CENTER
      strike(k, h / 2, 0.85, k % 2 ? 1 : -1)
    }

    function onKonami() {
      rainbow = !rainbow
      rippleRef.current()
    }

    layout()
    window.addEventListener('resize', layout)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    window.addEventListener('blur', release)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('site:konami', onKonami)
    document.addEventListener('mouseout', onMouseOut)

    return () => {
      cancelAnimationFrame(raf)
      stopScheduler()
      timers.forEach((id) => window.clearTimeout(id))
      release()
      rippleRef.current = () => {}
      relayoutRef.current = () => {}
      if (loopControlsRef) loopControlsRef.current = null
      window.removeEventListener('resize', layout)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
      window.removeEventListener('blur', release)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('site:konami', onKonami)
      document.removeEventListener('mouseout', onMouseOut)
    }
    // runs once; live values come through refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (rippleKey > 0) rippleRef.current()
  }, [rippleKey])

  useEffect(() => {
    relayoutRef.current()
  }, [settings.spacing])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  )
}
