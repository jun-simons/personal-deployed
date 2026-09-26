// src/components/instruments/grid-instrument.tsx
//
// The home page background: a row of vertical strings. Hovering a string makes
// it glow, clicking/tapping plucks it (it wobbles and, if sound is on, plays a
// note), and dragging across strings strums them. Everything is drawn on one
// canvas, and the animation loop only runs while something is moving.
'use client'

import { useEffect, useRef } from 'react'
import { useSound } from '@/components/providers/sound'
import { frequencyFor, type ScaleName } from './scales'

interface GridInstrumentProps {
  scale: ScaleName
  /** Grow the strings in from the center on mount (first-visit intro). */
  drawIn: boolean
  /** Increment to send a ripple across the strings (visual only). */
  rippleKey: number
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

// Clicks on these shouldn't also pluck a string underneath them.
const INTERACTIVE = 'a,button,input,select,textarea,label,summary,[data-no-instrument]'
// Pressing on text plucks once but doesn't strum, so text stays selectable.
const TEXT = 'p,li,h1,h2,h3,h4,dd,dt,blockquote,pre,code'

const DRAW_IN_MS = 800
const DRAW_IN_STAGGER_MS = 70
const WOBBLE_HZ = 6
const RING_SECONDS = 0.55
const MAX_SWING_PX = 7

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export default function GridInstrument({ scale, drawIn, rippleKey }: GridInstrumentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { getOutput, requestNudge } = useSound()

  // the canvas effect runs once; it reads current props through refs
  const scaleRef = useRef(scale)
  const soundRef = useRef({ getOutput, requestNudge })
  const drawInRef = useRef(drawIn)
  const rippleRef = useRef<() => void>(() => {})

  useEffect(() => {
    scaleRef.current = scale
  }, [scale])

  useEffect(() => {
    soundRef.current = { getOutput, requestNudge }
  }, [getOutput, requestNudge])

  useEffect(() => {
    const canvasEl = canvasRef.current
    const context = canvasEl?.getContext('2d')
    if (!canvasEl || !context) return
    const canvas: HTMLCanvasElement = canvasEl
    const g: CanvasRenderingContext2D = context

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const introStart = drawInRef.current && !reduced ? performance.now() + 120 : -Infinity

    let w = 0
    let h = 0
    let strings: Str[] = []
    let lineColor = '#cfccc8'
    let accentColor = '#8fa38b'
    let hoverX: number | null = null
    let dragX: number | null = null
    let raf = 0

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    function layout() {
      w = canvas.clientWidth
      h = canvas.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)

      const spacing = w < 640 ? 64 : 96
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
            ring = s.pluckStrength * Math.exp(-t / RING_SECONDS)
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

        stroke(x, top, bottom, bendY, swing, lineColor, 1)
        const glow = Math.max(s.hover, ring)
        if (glow > 0.01) {
          g.globalAlpha = glow
          stroke(x, top, bottom, bendY, swing, accentColor, 1 + 1.75 * glow)
          g.globalAlpha = 1
        }
      }

      if (busy) kick()
    }

    function play(k: number, strength: number) {
      const output = soundRef.current.getOutput()
      if (!output) {
        soundRef.current.requestNudge()
        return
      }
      const { ctx, out } = output
      const hz = frequencyFor(scaleRef.current, k)
      const t = ctx.currentTime

      // plucked-string-ish: bright attack that mellows as it decays
      const env = ctx.createGain()
      env.gain.setValueAtTime(0.0001, t)
      env.gain.exponentialRampToValueAtTime(0.16 * strength, t + 0.006)
      env.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)

      const tone = ctx.createBiquadFilter()
      tone.type = 'lowpass'
      tone.frequency.setValueAtTime(Math.min(hz * 8, 9000), t)
      tone.frequency.exponentialRampToValueAtTime(Math.max(hz * 1.5, 250), t + 1)

      const body = ctx.createOscillator()
      body.type = 'triangle'
      body.frequency.value = hz
      const shimmer = ctx.createOscillator()
      shimmer.type = 'sine'
      shimmer.frequency.value = hz * 2
      const shimmerLevel = ctx.createGain()
      shimmerLevel.gain.value = 0.3

      body.connect(tone)
      shimmer.connect(shimmerLevel)
      shimmerLevel.connect(tone)
      tone.connect(env)
      env.connect(out)

      body.start(t)
      shimmer.start(t)
      body.stop(t + 1.7)
      shimmer.stop(t + 1.7)
      body.onended = () => env.disconnect()
    }

    function pluck(s: Str, y: number, strength: number, dir: 1 | -1, withSound: boolean, delayMs = 0) {
      s.pluckAt = performance.now() + delayMs
      s.pluckStrength = Math.min(1, strength)
      s.pluckY = y
      s.dir = dir
      if (withSound) play(s.k, strength)
      kick()
    }

    rippleRef.current = () => {
      const reach = strings.length / 2 + 1
      for (const s of strings) {
        const falloff = 1 - Math.min(Math.abs(s.k) / reach, 0.8)
        pluck(s, h / 2, 0.55 * falloff, s.k % 2 ? 1 : -1, false, Math.abs(s.k) * 45)
      }
    }

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
        if (s.x > lo && s.x <= hi) pluck(s, e.clientY, 0.75, dir, true)
      }
      dragX = e.clientX
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest(INTERACTIVE)) return
      const s = nearest(e.clientX)
      if (s) pluck(s, e.clientY, 1, e.clientX < s.x ? 1 : -1, true)
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

    layout()
    window.addEventListener('resize', layout)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    window.addEventListener('blur', release)
    document.addEventListener('mouseout', onMouseOut)

    return () => {
      cancelAnimationFrame(raf)
      release()
      rippleRef.current = () => {}
      window.removeEventListener('resize', layout)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
      window.removeEventListener('blur', release)
      document.removeEventListener('mouseout', onMouseOut)
    }
  }, [])

  useEffect(() => {
    if (rippleKey > 0) rippleRef.current()
  }, [rippleKey])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  )
}
