// src/components/providers/sound.tsx
//
// One AudioContext for the whole site, created lazily the first time sound is
// actually needed (always inside a user gesture, so browsers let it start).
// It also owns the shared instrument settings (voice, scale, and the tuning
// drawer's knobs), so anything that plays a note, whether the home strings,
// the navbar letters, the loop pedal, or an easter egg, sounds consistent.
//
// Sound is muted by default. getOutput() / playNote() quietly do nothing while
// muted; mute state is shared, so turning sound on at home carries over to the
// theremin on /contact.
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { ScaleName } from '@/components/instruments/scales'
import { playVoice, type VoiceName } from '@/components/instruments/voices'

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export type Settings = {
  voice: VoiceName
  scale: ScaleName
  root: number // key: semitones above C, 0..11
  reverb: number // wet amount, 0..1
  tail: number // reverb length, seconds
  sustain: number // how long notes ring, seconds
  spacing: number // string spacing multiplier
}

export const DEFAULT_SETTINGS: Settings = {
  voice: 'pluck',
  scale: 'pentatonic',
  root: 0,
  reverb: 0.35,
  tail: 2.8,
  sustain: 1.6,
  spacing: 1,
}

export type AudioOut = { ctx: AudioContext; out: AudioNode }

type PlayOptions = {
  strength?: number // 0..1
  delay?: number // seconds from now
}

type SoundContextValue = {
  muted: boolean
  setMuted: (muted: boolean) => void
  toggleMuted: () => void
  /** A running context + node to connect voices to, or null when muted. */
  getOutput: () => AudioOut | null
  /** Play one note in the current voice. Returns false (and does nothing) while muted. */
  playNote: (hz: number, options?: PlayOptions) => boolean
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  resetSettings: () => void
  /** Bumped when something tries to play while muted, so the toggle can wiggle. */
  nudge: number
  requestNudge: () => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

type Graph = {
  ctx: AudioContext
  input: GainNode // everything plays into this
  wet: GainNode
  convolver: ConvolverNode
  output: GainNode // the mute stage, after the reverb so muting is instant
  tail: number
}

// A synthetic room: stereo noise with a smooth power-law decay. The convolver
// normalizes its level, so length changes don't change loudness much.
function impulse(ctx: AudioContext, seconds: number) {
  const rate = ctx.sampleRate
  const length = Math.max(1, Math.floor(rate * seconds))
  const buffer = ctx.createBuffer(2, length, rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3)
    }
  }
  return buffer
}

const wetLevel = (reverb: number) => reverb * 1.1

function buildGraph(settings: Settings): Graph | null {
  const Ctor = window.AudioContext ?? window.webkitAudioContext
  if (!Ctor) return null
  const ctx = new Ctor()

  const input = ctx.createGain()
  const glue = ctx.createDynamicsCompressor() // strummed chords never clip
  glue.threshold.value = -16
  glue.ratio.value = 4
  const output = ctx.createGain()

  // dry
  input.connect(glue)

  // reverb, slightly darkened on the way in
  const darken = ctx.createBiquadFilter()
  darken.type = 'lowpass'
  darken.frequency.value = 5200
  const convolver = ctx.createConvolver()
  convolver.buffer = impulse(ctx, settings.tail)
  const wet = ctx.createGain()
  wet.gain.value = wetLevel(settings.reverb)
  input.connect(darken)
  darken.connect(convolver)
  convolver.connect(wet)
  wet.connect(glue)

  glue.connect(output)
  output.connect(ctx.destination)

  return { ctx, input, wet, convolver, output, tail: settings.tail }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState(true)
  const [nudge, setNudge] = useState(0)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const mutedRef = useRef(true)
  const settingsRef = useRef(settings)
  const graphRef = useRef<Graph | null>(null)

  const ensureGraph = useCallback(() => {
    if (!graphRef.current) graphRef.current = buildGraph(settingsRef.current)
    const graph = graphRef.current
    if (graph?.ctx.state === 'suspended') void graph.ctx.resume()
    return graph
  }, [])

  const setMuted = useCallback(
    (next: boolean) => {
      mutedRef.current = next
      setMutedState(next)
      // unmuting always happens from a click, so this is where audio starts
      if (!next) ensureGraph()
      const graph = graphRef.current
      if (graph) {
        const t = graph.ctx.currentTime
        graph.output.gain.cancelScheduledValues(t)
        graph.output.gain.setTargetAtTime(next ? 0 : 1, t, 0.03)
      }
    },
    [ensureGraph]
  )

  const toggleMuted = useCallback(() => setMuted(!mutedRef.current), [setMuted])

  const getOutput = useCallback((): AudioOut | null => {
    if (mutedRef.current) return null
    const graph = ensureGraph()
    return graph ? { ctx: graph.ctx, out: graph.input } : null
  }, [ensureGraph])

  const playNote = useCallback(
    (hz: number, { strength = 1, delay = 0 }: PlayOptions = {}) => {
      const output = getOutput()
      if (!output) return false
      const { voice, sustain } = settingsRef.current
      playVoice(voice, {
        ctx: output.ctx,
        out: output.out,
        hz,
        strength,
        when: output.ctx.currentTime + Math.max(0, delay),
        sustain,
      })
      return true
    },
    [getOutput]
  )

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  const requestNudge = useCallback(() => setNudge((n) => n + 1), [])

  // Push reverb changes into the live graph. The tail rebuilds its impulse
  // response, so that's debounced while a slider is being dragged.
  useEffect(() => {
    settingsRef.current = settings
    const graph = graphRef.current
    if (!graph) return
    graph.wet.gain.setTargetAtTime(wetLevel(settings.reverb), graph.ctx.currentTime, 0.05)
    if (graph.tail === settings.tail) return
    const t = setTimeout(() => {
      graph.convolver.buffer = impulse(graph.ctx, settings.tail)
      graph.tail = settings.tail
    }, 150)
    return () => clearTimeout(t)
  }, [settings])

  useEffect(() => {
    return () => {
      void graphRef.current?.ctx.close()
    }
  }, [])

  const value = useMemo(
    () => ({
      muted,
      setMuted,
      toggleMuted,
      getOutput,
      playNote,
      settings,
      updateSettings,
      resetSettings,
      nudge,
      requestNudge,
    }),
    [muted, setMuted, toggleMuted, getOutput, playNote, settings, updateSettings, resetSettings, nudge, requestNudge]
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const value = useContext(SoundContext)
  if (!value) throw new Error('useSound must be used inside <SoundProvider>')
  return value
}
