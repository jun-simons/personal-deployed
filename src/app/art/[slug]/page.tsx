// src/app/art/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { pieces, getPiece } from '../pieces'
import Slideshow from '@/components/art/slideshow'

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return pieces.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const piece = getPiece(slug)
  return piece ? { title: piece.title, description: piece.description } : {}
}

export default async function ArtPiece({ params }: Params) {
  const { slug } = await params
  const piece = getPiece(slug)
  if (!piece) notFound()

  return (
    <main className="mx-auto flex h-[100svh] w-full max-w-6xl flex-col pb-2 pt-20 sm:pt-24">
      <header className="flex flex-wrap items-baseline gap-x-8 gap-y-2 px-6 pb-4 font-mono sm:gap-x-10 sm:px-8">
        <Link href="/art" className="text-sm text-muted transition-colors hover:text-rose-400">
          ← all art
        </Link>
        <h1 className="font-display text-2xl tracking-wider sm:text-3xl">{piece.title}</h1>
        {piece.year && <span className="text-sm tabular-nums text-muted">{piece.year}</span>}
      </header>

      {piece.description && (
        <p className="max-w-prose px-6 pb-4 font-mono text-sm leading-relaxed text-muted sm:px-8">
          {piece.description}
        </p>
      )}

      <Slideshow media={piece.media} />
    </main>
  )
}
