// src/components/instruments/voices.ts
//
// The synth voices the home strings (and anything else that plays notes) can
// use. Each one is a small, self-cleaning Web Audio patch: build nodes, shape
// an envelope that ends near silence, stop the oscillators, disconnect.

export const VOICES = {
  pluck: { label: 'pluck' },
  bell: { label: 'bell' },
  pad: { label: 'pad' },
  chip: { label: 'chip' },
} as const

export type VoiceName = keyof typeof VOICES

export const VOICE_ORDER: VoiceName[] = ['pluck', 'bell', 'pad', 'chip']

export function nextVoice(voice: VoiceName): VoiceName {
  return VOICE_ORDER[(VOICE_ORDER.indexOf(voice) + 1) % VOICE_ORDER.length]
}

type Note = {
  ctx: AudioContext
  out: AudioNode
  hz: number
  strength: number // 0..1
  when: number // AudioContext time
  sustain: number // seconds, from the tuning drawer
}

function envelope(ctx: AudioContext, when: number, peak: number, attack: number, decay: number) {
  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, when)
  env.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), when + attack)
  env.gain.exponentialRampToValueAtTime(0.0001, when + attack + decay)
  return env
}

function run(sources: OscillatorNode[], when: number, end: number, env: GainNode) {
  for (const s of sources) {
    s.start(when)
    s.stop(end + 0.05)
  }
  sources[0].onended = () => env.disconnect()
}

// Bright attack that mellows as it rings, like a nylon string.
function pluck({ ctx, out, hz, strength, when, sustain }: Note) {
  const env = envelope(ctx, when, 0.16 * strength, 0.006, sustain)
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.setValueAtTime(Math.min(hz * 8, 9000), when)
  tone.frequency.exponentialRampToValueAtTime(Math.max(hz * 1.5, 250), when + sustain * 0.6)

  const body = ctx.createOscillator()
  body.type = 'triangle'
  body.frequency.value = hz
  const shimmer = ctx.createOscillator()
  shimmer.frequency.value = hz * 2
  const shimmerLevel = ctx.createGain()
  shimmerLevel.gain.value = 0.3

  body.connect(tone)
  shimmer.connect(shimmerLevel)
  shimmerLevel.connect(tone)
  tone.connect(env)
  env.connect(out)
  run([body, shimmer], when, when + sustain, env)
}

// Two-operator FM with an inharmonic ratio: glassy, like a small bell.
function bell({ ctx, out, hz, strength, when, sustain }: Note) {
  const decay = sustain * 1.6
  const env = envelope(ctx, when, 0.12 * strength, 0.004, decay)

  const carrier = ctx.createOscillator()
  carrier.frequency.value = hz
  const modulator = ctx.createOscillator()
  modulator.frequency.value = hz * 3.5
  const index = ctx.createGain()
  index.gain.setValueAtTime(hz * 2.2, when)
  index.gain.exponentialRampToValueAtTime(hz * 0.15, when + decay * 0.6)

  modulator.connect(index)
  index.connect(carrier.frequency)
  carrier.connect(env)
  env.connect(out)
  run([carrier, modulator], when, when + decay, env)
}

// Two gently detuned saws through a soft filter, with a slow swell.
function pad({ ctx, out, hz, strength, when, sustain }: Note) {
  const attack = 0.22
  const decay = sustain * 1.5
  const env = envelope(ctx, when, 0.07 * strength, attack, decay)
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = Math.min(hz * 3, 5000)
  tone.Q.value = 0.6

  const a = ctx.createOscillator()
  const b = ctx.createOscillator()
  a.type = 'sawtooth'
  b.type = 'sawtooth'
  a.frequency.value = hz
  b.frequency.value = hz
  a.detune.value = -7
  b.detune.value = 7

  a.connect(tone)
  b.connect(tone)
  tone.connect(env)
  env.connect(out)
  run([a, b], when, when + attack + decay, env)
}

// A square wave with a quick octave blip on the attack, like an old console.
function chip({ ctx, out, hz, strength, when, sustain }: Note) {
  const decay = Math.min(sustain * 0.5, 0.7) + 0.08
  const env = envelope(ctx, when, 0.05 * strength, 0.002, decay)
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 4200

  const sq = ctx.createOscillator()
  sq.type = 'square'
  sq.frequency.setValueAtTime(hz * 2, when)
  sq.frequency.setValueAtTime(hz, when + 0.03)

  sq.connect(tone)
  tone.connect(env)
  env.connect(out)
  run([sq], when, when + decay, env)
}

const PLAYERS: Record<VoiceName, (note: Note) => void> = { pluck, bell, pad, chip }

export function playVoice(voice: VoiceName, note: Note) {
  PLAYERS[voice](note)
}
