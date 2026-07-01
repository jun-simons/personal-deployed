// src/app/art/page.tsx
import Link from 'next/link'
import { pieces } from './pieces'

export default function ArtIndex() {
  return (
    <main className="max-w-3xl mx-auto px-6 sm:px-8 py-12">
      <header className="mb-16">
        <h1 className="font-display text-5xl sm:text-6xl tracking-widest mb-6">
          art
        </h1>
        <p className="font-monoreg text-base text-neutral-300 leading-relaxed max-w-prose">
          a collection of things ive made 
        </p>
      </header>

      <ul className="space-y-5">
        {pieces.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/art/${p.slug}`}
              className="
                group
                flex items-baseline justify-between gap-4
                font-monoreg
                py-1
                border-b border-neutral-800 hover:border-rose-500/60
                transition-colors
              "
            >
              <span className="text-xl text-neutral-100 group-hover:text-rose-400 transition-colors">
                {p.title}
              </span>
              {p.year && (
                <span className="text-sm text-neutral-500 group-hover:text-rose-400/70 transition-colors tabular-nums">
                  {p.year}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
