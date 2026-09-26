// src/components/providers/intro.tsx
//
// Remembers (for this visit) whether the home intro has already played, so
// coming back to "/" from another page goes straight to the text instead of
// replaying the whole sequence. The navbar also reads it to stay hidden until
// the intro hands off.
'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type IntroContextValue = {
  introDone: boolean
  finishIntro: () => void
}

const IntroContext = createContext<IntroContextValue | null>(null)

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introDone, setIntroDone] = useState(false)
  const finishIntro = useCallback(() => setIntroDone(true), [])
  const value = useMemo(() => ({ introDone, finishIntro }), [introDone, finishIntro])
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}

export function useIntro() {
  const value = useContext(IntroContext)
  if (!value) throw new Error('useIntro must be used inside <IntroProvider>')
  return value
}
