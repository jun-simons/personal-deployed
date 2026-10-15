// src/app/art/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { pieces, getPiece } from '../pieces'
import PieceView from '@/components/art/piece-view'

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
      <PieceView piece={piece} />
    </main>
  )
}
