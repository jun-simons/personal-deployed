// src/app/template.tsx
//
// Templates remount on every navigation, which makes them a simple place for a
// page fade. The very first render is left alone so server-rendered content is
// visible immediately; only client-side navigations fade in. Opacity only (no
// transform) so fixed-position children like the home canvas stay fixed.
'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'

let hasNavigated = false

export default function Template({ children }: { children: React.ReactNode }) {
  const animateIn = hasNavigated

  useEffect(() => {
    hasNavigated = true
  }, [])

  return (
    <motion.div
      initial={animateIn ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
