// src/components/art/horizontal-scroller.tsx
'use client'

import { useEffect, useRef } from 'react'

interface HorizontalScrollerProps {
  children: React.ReactNode
}

export default function HorizontalScroller({ children }: HorizontalScrollerProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Translate vertical wheel into horizontal scroll so trackpads / mice with
  // only a Y wheel can navigate the gallery. Native horizontal swipes (deltaX)
  // pass through unchanged.
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      el.scrollBy({ left: e.deltaY, behavior: 'auto' })
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Arrow-key navigation between snap points.
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      const items = Array.from(el.children) as HTMLElement[]
      if (items.length === 0) return
      const dir = e.key === 'ArrowRight' ? 1 : -1
      const center = el.scrollLeft + el.clientWidth / 2
      const idx = items.findIndex(
        (c) => c.offsetLeft + c.offsetWidth / 2 > center
      )
      const currentIdx = idx === -1 ? items.length - 1 : Math.max(0, idx - (dir > 0 ? 0 : 1))
      const target = items[Math.min(items.length - 1, Math.max(0, currentIdx + dir))]
      if (target) {
        el.scrollTo({
          left: target.offsetLeft + target.offsetWidth / 2 - el.clientWidth / 2,
          behavior: 'smooth',
        })
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      ref={ref}
      className="
        flex-1 min-h-0
        flex
        overflow-x-auto overflow-y-hidden
        snap-x snap-mandatory
        scroll-smooth
        art-scrollbar
      "
    >
      {children}
    </div>
  )
}
