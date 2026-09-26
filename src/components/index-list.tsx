// src/components/index-list.tsx
//
// The ruled list used by both /blog and /art. Title on the left, date and tag
// on the right; on narrow screens the metadata drops under the title so long
// titles wrap instead of truncating.
import Link from 'next/link'
import type { ReactNode } from 'react'

type Accent = 'green' | 'rose'

const accents: Record<Accent, { row: string; title: string; meta: string }> = {
  green: {
    row: 'hover:border-green-700/60',
    title: 'group-hover:text-green-700',
    meta: 'group-hover:text-green-700/70',
  },
  rose: {
    row: 'hover:border-rose-500/60',
    title: 'group-hover:text-rose-400',
    meta: 'group-hover:text-rose-400/70',
  },
}

export type IndexItem = {
  href: string
  title: string
  date?: string
  tag?: ReactNode
  /** image shown next to the cursor on hover (inside <HoverPreview>) */
  preview?: string
}

export default function IndexList({ items, accent }: { items: IndexItem[]; accent: Accent }) {
  const a = accents[accent]
  return (
    <ul>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            data-preview={item.preview}
            className={`group flex flex-col gap-1.5 border-b border-rule py-4 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 ${a.row}`}
          >
            <span className={`font-monoreg text-lg transition-colors sm:text-xl ${a.title}`}>
              {item.title}
            </span>
            <span className="flex shrink-0 items-center gap-3">
              {item.date && (
                <span className={`font-mono text-sm tabular-nums text-muted transition-colors ${a.meta}`}>
                  {item.date}
                </span>
              )}
              {item.tag}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
