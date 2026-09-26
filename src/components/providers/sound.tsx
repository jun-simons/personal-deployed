// src/components/providers/sound.tsx
//
// One AudioContext for the whole site, created lazily the first time sound is
// actually needed (always inside a user gesture, so browsers let it start).
// Instruments ask for an output node with getOutput(); it returns null while
// muted, which is the default. Mute state is shared, so turning sound on at
// the home instrument carries over to the theremin on /contact.
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

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export type AudioOut = { ctx: AudioContext; out: AudioNode }

type SoundContextValue = {
  muted: boolean
  setMuted: (muted: boolean) => void
  toggleMuted: () => void
  /** A running context + node to connect voices to, or null when muted. */
  getOutput: () => AudioOut | null
  /** Bumped when something tries to play while muted, so the toggle can wiggle. */
  nudge: number
  requestNudge: () => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

type Graph = { ctx: AudioContext; master: GainNode }

function buildGraph(): Graph | null {
  const Ctor = window.AudioContext ?? window.webkitAudioContext
  if (!Ctor) return null
  const ctx = new Ctor()

  // master → compressor → speakers, so strummed chords never clip
  const master = ctx.createGain()
  const glue = ctx.createDynamicsCompressor()
  glue.threshold.value = -16
  glue.ratio.value = 4
  master.connect(glue)
  glue.connect(ctx.destination)

  // a soft, darkened echo for a little room sound
  const send = ctx.createGain()
  const delay = ctx.createDelay(1)
  const feedback = ctx.createGain()
  const damp = ctx.createBiquadFilter()
  send.gain.value = 0.2
  delay.delayTime.value = 0.24
  feedback.gain.value = 0.3
  damp.type = 'lowpass'
  damp.frequency.value = 2200
  master.connect(send)
  send.connect(delay)
  delay.connect(damp)
  damp.connect(feedback)
  feedback.connect(delay)
  damp.connect(glue)

  return { ctx, master }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState(true)
  const [nudge, setNudge] = useState(0)
  const mutedRef = useRef(true)
  const graphRef = useRef<Graph | null>(null)

  const ensureGraph = useCallback(() => {
    if (!graphRef.current) graphRef.current = buildGraph()
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
        graph.master.gain.cancelScheduledValues(t)
        graph.master.gain.setTargetAtTime(next ? 0 : 1, t, 0.03)
      }
    },
    [ensureGraph]
  )

  const toggleMuted = useCallback(() => setMuted(!mutedRef.current), [setMuted])

  const getOutput = useCallback((): AudioOut | null => {
    if (mutedRef.current) return null
    const graph = ensureGraph()
    return graph ? { ctx: graph.ctx, out: graph.master } : null
  }, [ensureGraph])

  const requestNudge = useCallback(() => setNudge((n) => n + 1), [])

  useEffect(() => {
    return () => {
      void graphRef.current?.ctx.close()
    }
  }, [])

  const value = useMemo(
    () => ({ muted, setMuted, toggleMuted, getOutput, nudge, requestNudge }),
    [muted, setMuted, toggleMuted, getOutput, nudge, requestNudge]
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const value = useContext(SoundContext)
  if (!value) throw new Error('useSound must be used inside <SoundProvider>')
  return value
}
