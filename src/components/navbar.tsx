// src/components/navbar.tsx
//
// Rendered once in the root layout, so it stays put across navigation instead
// of re-animating on every page. On the home page it waits for the intro to
// finish before dropping in.
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { frequencyFor } from '@/components/instruments/scales'
import { useIntro } from '@/components/providers/intro'
import { useSound } from '@/components/providers/sound'

// Each section keeps its own accent color. Class names are written out in full
// so Tailwind picks them up.
const links = [
  {
    href: '/blog',
    label: 'projects',
    hover: 'hover:text-green-700 hover:decoration-green-700',
    active: 'text-green-700 decoration-green-700',
  },
  {
    href: '/art',
    label: 'art',
    hover: 'hover:text-rose-500 hover:decoration-rose-500',
    active: 'text-rose-500 decoration-rose-500',
  },
  {
    href: '/contact',
    label: 'contact',
    hover: 'hover:text-orange-500 hover:decoration-orange-500',
    active: 'text-orange-500 decoration-orange-500',
  },
] as const

const titleVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const letterVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 26 } },
}

const letterHover = { y: -5, transition: { type: 'spring', stiffness: 500, damping: 20 } }

const TITLE = 'junsimons.com'
// the letters walk up the current scale, starting a few steps below the tonic
const TITLE_FIRST_STEP = -4

export default function Navbar() {
  const pathname = usePathname()
  const { introDone } = useIntro()
  const { playNote, settings } = useSound()
  const [menuOpen, setMenuOpen] = useState(false)

  const onHome = pathname === '/'
  const visible = !onHome || introDone

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  // Transparent over the home instrument so the strings run to the top edge;
  // solid everywhere else so scrolling content passes cleanly underneath.
  const surface = onHome && !menuOpen ? 'bg-transparent' : 'bg-background'

  return (
    <motion.nav
      aria-label="Main"
      data-no-instrument
      initial={false}
      animate={visible ? { y: 0, opacity: 1 } : { y: -24, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: visible && onHome ? 0.5 : 0 }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      className={`fixed inset-x-0 top-0 z-40 font-mono transition-colors duration-500 ${surface}`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4 sm:px-8 sm:py-5">
        <Link href="/" aria-label="junsimons.com, home" className="no-underline">
          <motion.span
            aria-hidden
            className="flex text-base sm:text-lg"
            variants={titleVariants}
            initial="hidden"
            animate={visible ? 'visible' : 'hidden'}
          >
            {/* each letter is a key: sweep across them to play a little run */}
            {[...TITLE].map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                whileHover={letterHover}
                onHoverStart={() =>
                  playNote(frequencyFor(settings.scale, TITLE_FIRST_STEP + i, settings.root), {
                    strength: 0.45,
                  })
                }
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </Link>

        {/* desktop links */}
        <ul className="hidden items-center gap-7 text-base sm:flex sm:text-lg">
          {links.map((l) => {
            const active = isActive(l.href)
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={`underline-offset-[6px] transition-colors ${
                    active ? `underline ${l.active}` : `hover:underline ${l.hover}`
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* mobile toggle: three thin rules that fold into an x */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="relative flex h-8 w-8 items-center justify-center sm:hidden"
        >
          <span
            className={`absolute block h-px w-5 bg-current transition-transform duration-200 ${
              menuOpen ? 'rotate-45' : '-translate-y-1.5'
            }`}
          />
          <span
            className={`absolute block h-px w-5 bg-current transition-opacity duration-200 ${
              menuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute block h-px w-5 bg-current transition-transform duration-200 ${
              menuOpen ? '-rotate-45' : 'translate-y-1.5'
            }`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.ul
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex flex-col items-end gap-4 px-6 pb-6 pt-1 text-lg sm:hidden"
          >
            {links.map((l) => {
              const active = isActive(l.href)
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`underline-offset-[6px] transition-colors ${
                      active ? `underline ${l.active}` : `hover:underline ${l.hover}`
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
