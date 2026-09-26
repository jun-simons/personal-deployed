// src/components/instruments/theremin.tsx
//
// Press and drag inside the box: height sets pitch (on an exponential curve, so
// equal distances are equal intervals), horizontal position sets volume.
//   - the faint horizontal lines are the notes of the current key + scale
//     (shared with the home instrument's tuning); the octave C's are labeled
//   - "glide" plays every pitch in between; "snap" slides quickly onto the
//     nearest note of the scale
//   - each finger leaves a fading ink trail and shows its note; up to three
//     fingers play at once on touch screens
// Mouse, touch, and pen all go through pointer events + pointer capture, and
// everything visual is drawn on one canvas that only animates while needed.
'use client'

import { useEffect, useRef, useState } from 'react'
import { useSound, type Settings } from '@/components/providers/sound'
import { NOTE_NAMES, SCALES, nextScale } from './scales'

const MIN_HZ = 110
const MAX_HZ = 1100
const MAX_FINGERS = 3
const TRAIL_MS = 900
const INK = '#f97316' // orange-500, the contact page accent
const MIDDLE_C_HZ = 261.63

type PitchMode = 'glide' | 'snap'

type Voice = {
  ctx: AudioContext
  osc: OscillatorNode
  lfo: OscillatorNode
  depth: GainNode
  level: GainNode
}

type Point = { x: number; y: number; t: number }

type Finger = {
  x: number // 0..1 across
  y: number // 0..1 down
  hz: number
  trail: Point[]
  voice: Voice | null
}

type Note = { hz: number; tonic: boolean }

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const span = Math.log(MAX_HZ / MIN_HZ)
const yForHz = (hz: number) => 1 - Math.log(hz / MIN_HZ) / span
const hzForY = (y: number) => MIN_HZ * Math.exp((1 - y) * span)

/** Every note of the scale that falls inside the theremin's range. */
function scaleNotes(scale: Settings['scale'], root: number): Note[] {
  const tonic = MIDDLE_C_HZ * 2 ** (root / 12)
  const notes: Note[] = []
  for (let octave = -3; octave <= 3; octave++) {
    SCALES[scale].ratios.forEach((ratio, i) => {
      const hz = tonic * ratio * 2 ** octave
      if (hz >= MIN_HZ * 0.98 && hz <= MAX_HZ * 1.02) notes.push({ hz, tonic: i === 0 })
    })
  }
  return notes.sort((a, b) => a.hz - b.hz)
}

/** Nearest equal-tempered name, e.g. "A4". Close enough for just intonation. */
function noteName(hz: number) {
  const semis = Math.round(12 * Math.log2(hz / MIDDLE_C_HZ))
  return `${NOTE_NAMES[((semis % 12) + 12) % 12]}${4 + Math.floor(semis / 12)}`
}

// A sine with a few soft overtones: closer to a real theremin's slightly
// reedy tone than a pure sine. Built once per AudioContext.
const waves = new WeakMap<AudioContext, PeriodicWave>()
function thereminWave(ctx: AudioContext) {
  let wave = waves.get(ctx)
  if (!wave) {
    const real = new Float32Array([0, 0, 0, 0, 0])
    const imag = new Float32Array([0, 1, 0.22, 0.1, 0.04])
    wave = ctx.createPeriodicWave(real, imag)
    waves.set(ctx, wave)
  }
  return wave
}

export default function Theremin() {
  const { muted, setMuted, getOutput, settings, updateSettings } = useSound()
  const [mode, setMode] = useState<PitchMode>('glide')
  const [playing, setPlaying] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fingers = useRef(new Map<number, Finger>())
  const ghosts = useRef<Point[][]>([]) // trails of released fingers, still fading
  const kickRef = useRef<() => void>(() => {})

  // pointer handlers and the draw loop read current values through this ref
  const live = useRef({ mode, settings, getOutput, notes: scaleNotes(settings.scale, settings.root) })
  useEffect(() => {
    live.current = { mode, settings, getOutput, notes: scaleNotes(settings.scale, settings.root) }
    kickRef.current() // redraw the note lines when the key/scale changes
  }, [mode, settings, getOutput])

  // ---- drawing --------------------------------------------------------------

  useEffect(() => {
    const canvasEl = canvasRef.current
    const context = canvasEl?.getContext('2d')
    if (!canvasEl || !context) return
    const canvas: HTMLCanvasElement = canvasEl
    const g: CanvasRenderingContext2D = context

    let w = 0
    let h = 0
    let raf = 0
    let colors = { line: '#cfccc8', tonic: '#8a8683', label: '#8a8683', text: '#5f5c59', font: 'monospace' }

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    kickRef.current = kick

    function resize() {
      w = canvas.clientWidth
      h = canvas.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      const css = getComputedStyle(document.documentElement)
      colors = {
        line: css.getPropertyValue('--grid-line').trim() || colors.line,
        tonic: css.getPropertyValue('--faint').trim() || colors.tonic,
        label: css.getPropertyValue('--faint').trim() || colors.label,
        text: css.getPropertyValue('--muted').trim() || colors.text,
        font: css.getPropertyValue('--font-mono-light').trim() || colors.font,
      }
      kick()
    }

    function drawTrail(trail: Point[], now: number) {
      for (let i = 1; i < trail.length; i++) {
        const age = now - trail[i].t
        if (age > TRAIL_MS) continue
        g.globalAlpha = 0.55 * (1 - age / TRAIL_MS)
        g.beginPath()
        g.moveTo(trail[i - 1].x * w, trail[i - 1].y * h)
        g.lineTo(trail[i].x * w, trail[i].y * h)
        g.strokeStyle = INK
        g.lineWidth = 2
        g.lineCap = 'round'
        g.stroke()
      }
      g.globalAlpha = 1
    }

    function frame(now: number) {
      raf = 0
      g.clearRect(0, 0, w, h)
      let busy = false

      // note lines: the scale's notes, octave tonics a little stronger + labeled
      g.font = `10px ${colors.font}`
      g.textBaseline = 'bottom'
      for (const note of live.current.notes) {
        const y = Math.round(yForHz(note.hz) * h) + 0.5
        g.beginPath()
        g.moveTo(0, y)
        g.lineTo(w, y)
        g.strokeStyle = note.tonic ? colors.tonic : colors.line
        g.globalAlpha = note.tonic ? 0.45 : 1
        g.lineWidth = 1
        g.stroke()
        g.globalAlpha = 1
        if (note.tonic) {
          g.fillStyle = colors.label
          g.fillText(noteName(note.hz), 8, y - 3)
        }
      }

      // fading trails of fingers that have let go
      ghosts.current = ghosts.current.filter((trail) => now - trail[trail.length - 1].t < TRAIL_MS)
      for (const trail of ghosts.current) {
        drawTrail(trail, now)
        busy = true
      }

      // live fingers: trail, dot, and a small note readout
      g.font = `11px ${colors.font}`
      g.textBaseline = 'middle'
      for (const f of fingers.current.values()) {
        f.trail = f.trail.filter((p) => now - p.t < TRAIL_MS)
        drawTrail(f.trail, now)
        busy = true

        const x = f.x * w
        const y = f.y * h
        g.beginPath()
        g.arc(x, y, 11, 0, Math.PI * 2)
        g.fillStyle = 'rgb(249 115 22 / 0.16)'
        g.fill()
        g.beginPath()
        g.arc(x, y, 5, 0, Math.PI * 2)
        g.fillStyle = INK
        g.fill()

        const label = `${noteName(f.hz)} · ${Math.round(f.hz)} hz`
        const width = g.measureText(label).width
        const flip = x + 18 + width > w - 6
        g.fillStyle = colors.text
        g.textAlign = flip ? 'right' : 'left'
        g.fillText(label, flip ? x - 18 : x + 18, Math.max(10, y - 14))
        g.textAlign = 'left'
      }

      if (busy) kick()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      kickRef.current = () => {}
    }
  }, [])

  // ---- sound ------------------------------------------------------------------

  function pitchAt(y: number) {
    const free = hzForY(y)
    if (live.current.mode === 'glide') return free
    let best = free
    let bestDist = Infinity
    for (const note of live.current.notes) {
      const d = Math.abs(Math.log(note.hz / free))
      if (d < bestDist) {
        best = note.hz
        bestDist = d
      }
    }
    return best
  }

  const volumeAt = (x: number) => 0.02 + x * 0.16

  function startVoice(hz: number, volume: number): Voice | null {
    const output = live.current.getOutput()
    if (!output) return null
    const { ctx, out } = output
    const t = ctx.currentTime

    const level = ctx.createGain()
    level.gain.setValueAtTime(0, t)
    level.gain.setTargetAtTime(volume, t, 0.03)

    const osc = ctx.createOscillator()
    osc.setPeriodicWave(thereminWave(ctx))
    osc.frequency.setValueAtTime(hz, t)

    // vibrato about 10 cents wide at any pitch, like a player's hand
    const lfo = ctx.createOscillator()
    const depth = ctx.createGain()
    lfo.frequency.value = 5.5
    depth.gain.value = hz * 0.006
    lfo.connect(depth)
    depth.connect(osc.frequency)

    osc.connect(level)
    level.connect(out)
    osc.start(t)
    lfo.start(t)
    return { ctx, osc, lfo, depth, level }
  }

  function silence(voice: Voice | null) {
    if (!voice) return
    const t = voice.ctx.currentTime
    voice.level.gain.cancelScheduledValues(t)
    voice.level.gain.setTargetAtTime(0, t, 0.04)
    voice.osc.stop(t + 0.3)
    voice.lfo.stop(t + 0.3)
    voice.osc.onended = () => voice.level.disconnect()
  }

  // ---- pointer input --------------------------------------------------------

  const read = (e: React.PointerEvent) => {
    const rect = boxRef.current!.getBoundingClientRect()
    return {
      x: clamp01((e.clientX - rect.left) / rect.width),
      y: clamp01((e.clientY - rect.top) / rect.height),
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || fingers.current.size >= MAX_FINGERS) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // the pointer can already be gone (e.g. a very quick tap); play anyway
    }
    const { x, y } = read(e)
    const hz = pitchAt(y)
    fingers.current.set(e.pointerId, {
      x,
      y,
      hz,
      trail: [{ x, y, t: performance.now() }],
      voice: startVoice(hz, volumeAt(x)),
    })
    setPlaying(true)
    kickRef.current()
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const f = fingers.current.get(e.pointerId)
    if (!f) return
    const { x, y } = read(e)
    f.x = x
    f.y = y
    f.hz = pitchAt(y)
    f.trail.push({ x, y, t: performance.now() })
    if (f.voice) {
      const t = f.voice.ctx.currentTime
      const glide = live.current.mode === 'snap' ? 0.03 : 0.02
      f.voice.osc.frequency.setTargetAtTime(f.hz, t, glide)
      f.voice.depth.gain.setTargetAtTime(f.hz * 0.006, t, 0.05)
      f.voice.level.gain.setTargetAtTime(volumeAt(x), t, 0.03)
    }
    kickRef.current()
  }

  const release = (e: React.PointerEvent<HTMLDivElement>) => {
    const f = fingers.current.get(e.pointerId)
    if (!f) return
    fingers.current.delete(e.pointerId)
    silence(f.voice)
    if (f.trail.length > 1) ghosts.current.push(f.trail)
    setPlaying(fingers.current.size > 0)
    kickRef.current()
  }

  // muting (or leaving the page) stops every voice; the visuals keep going
  useEffect(() => {
    if (!muted) return
    for (const f of fingers.current.values()) {
      silence(f.voice)
      f.voice = null
    }
  }, [muted])

  useEffect(() => {
    const all = fingers.current
    return () => {
      for (const f of all.values()) silence(f.voice)
      all.clear()
    }
  }, [])

  const choice = (active: boolean) =>
    `underline-offset-4 transition-colors ${
      active
        ? 'text-foreground underline decoration-orange-500'
        : 'hover:text-foreground hover:underline decoration-faint'
    }`

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
      >
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
        {!playing && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-sm text-faint">
            press &amp; drag
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1 font-mono text-sm text-muted">
        <p>
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
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span>pitch:</span>
          <button type="button" onClick={() => setMode('glide')} aria-pressed={mode === 'glide'} className={choice(mode === 'glide')}>
            glide
          </button>
          <button type="button" onClick={() => setMode('snap')} aria-pressed={mode === 'snap'} className={choice(mode === 'snap')}>
            snap
          </button>
          <span className="text-faint">to</span>
          <button
            type="button"
            onClick={() => updateSettings({ scale: nextScale(settings.scale) })}
            title="change scale"
            className="transition-colors hover:text-foreground"
          >
            {NOTE_NAMES[settings.root]} {SCALES[settings.scale].label}
          </button>
        </p>
      </div>
    </div>
  )
}
