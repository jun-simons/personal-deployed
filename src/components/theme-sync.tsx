// src/components/theme-sync.tsx
//
// Keeps html[data-theme] in step with the route on client navigation. The
// matching pre-paint script in the root layout handles hard loads.
'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

export function themeForPath(pathname: string) {
  return pathname.startsWith('/art') ? 'dark' : 'light'
}

export default function ThemeSync() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = themeForPath(pathname)
  }, [pathname])

  return null
}
