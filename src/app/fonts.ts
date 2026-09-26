// src/app/fonts.ts
//
// Loaded through next/font so the files are preloaded and self-hosted. This
// matters most for the home intro: the display font is ready before the name
// animates in, so it never flashes in a fallback face.
import localFont from 'next/font/local'

export const displayFont = localFont({
  src: '../../public/fonts/OffBitTrial-101.otf',
  variable: '--font-display',
  display: 'block',
})

export const monoLight = localFont({
  src: '../../public/fonts/InputMonoLight.ttf',
  variable: '--font-mono-light',
  display: 'swap',
})

export const monoRegular = localFont({
  src: '../../public/fonts/InputMonoRegular.ttf',
  variable: '--font-mono-regular',
  display: 'swap',
})
