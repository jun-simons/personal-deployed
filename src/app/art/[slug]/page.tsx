// src/app/art/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { pieces, getPiece } from '../pieces'
import MediaItem from '@/components/art/media-item'
import HorizontalScroller from '@/components/art/horizontal-scroller'

export function generateStaticParams() {
  return pieces.map((p) => ({ slug: p.slug }))
}

export default async function ArtPiece({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const piece = getPiece(slug)
  if (!piece) notFound()

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      {/* Header strip */}
      <header className="px-6 sm:px-8 pb-4 flex items-baseline justify-between gap-4 font-monoreg">
        <div className="flex items-baseline gap-6 sm:gap-10 min-w-0">
          <Link
            href="/art"
            className="text-sm text-neutral-500 hover:text-rose-400 transition-colors shrink-0"
          >
            ← all art
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-neutral-100 truncate">
            {piece.title}
          </h1>
          {piece.year && (
            <span className="text-sm text-neutral-500 tabular-nums">
              {piece.year}
            </span>
          )}
        </div>
      </header>

      {piece.description && (
        <p className="px-6 sm:px-8 pb-4 font-monoreg text-sm text-neutral-400 max-w-prose">
          {piece.description}
        </p>
      )}

      {/* Horizontal snap-scroll gallery */}
      <HorizontalScroller>
        {piece.media.map((item, i) => (
          <MediaItem key={i} item={item} />
        ))}
      </HorizontalScroller>
    </div>
  )
}
