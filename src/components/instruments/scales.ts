// src/components/instruments/scales.ts
//
// Each scale is one octave of just-intonation ratios. Strings are numbered
// outward from the center of the screen (k = 0 is the middle string), so the
// tonic always sits in the middle, notes rise to the right and fall to the
// left, and the range grows naturally with screen width. The key (root) moves
// the tonic up from middle C by 0–11 semitones.

export const SCALES = {
  pentatonic: { label: 'pentatonic', ratios: [1, 9 / 8, 5 / 4, 3 / 2, 15 / 8] },
  just: { label: 'just major', ratios: [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8] },
  blues: { label: 'blues', ratios: [1, 6 / 5, 4 / 3, 45 / 32, 3 / 2, 9 / 5] },
} as const

export type ScaleName = keyof typeof SCALES

export const SCALE_ORDER: ScaleName[] = ['pentatonic', 'just', 'blues']

export function nextScale(scale: ScaleName): ScaleName {
  return SCALE_ORDER[(SCALE_ORDER.indexOf(scale) + 1) % SCALE_ORDER.length]
}

// ASCII accidentals so they render in the site's monospace font
export const NOTE_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

const MIDDLE_C_HZ = 261.63
const LOWEST_HZ = 70
const HIGHEST_HZ = 2100

/** Frequency of string k, in the given scale and key (root = semitones above C). */
export function frequencyFor(scale: ScaleName, k: number, root = 0): number {
  const ratios = SCALES[scale].ratios
  const n = ratios.length
  const degree = ((k % n) + n) % n
  const octave = Math.floor(k / n)
  const tonic = MIDDLE_C_HZ * 2 ** (root / 12)
  let hz = tonic * ratios[degree] * 2 ** octave
  // very wide screens would run off the audible/pleasant range — fold back in
  while (hz < LOWEST_HZ) hz *= 2
  while (hz > HIGHEST_HZ) hz /= 2
  return hz
}
