// src/app/art/page.tsx
import type { Metadata } from 'next'
import { pieces } from './pieces'
import HoverPreview from '@/components/hover-preview'
import IndexList from '@/components/index-list'
import PageHeader from '@/components/page-header'
import Tag from '@/components/tag'

export const metadata: Metadata = {
  title: 'art / photography',
}

export default function ArtIndex() {
  const covers = pieces.flatMap((p) => (p.cover ? [p.cover] : []))

  return (
    <main className="mx-auto max-w-3xl px-6 pb-28 pt-28 sm:px-8 sm:pt-36">
      <PageHeader title="art / photography">a collection of things ive made</PageHeader>

      <HoverPreview images={covers}>
        <IndexList
          accent="rose"
          items={pieces.map((p) => ({
            href: `/art/${p.slug}`,
            title: p.title,
            date: p.year,
            tag: p.tag && <Tag type={p.tag} />,
            preview: p.cover,
          }))}
        />
      </HoverPreview>
    </main>
  )
}
