// src/app/art/page.tsx
import type { Metadata } from 'next'
import { pieces, previewFor, type Preview } from './pieces'
import HoverPreview from '@/components/hover-preview'
import IndexList from '@/components/index-list'
import PageHeader from '@/components/page-header'
import Tag from '@/components/tag'

export const metadata: Metadata = {
  title: 'art / photography',
}

export default function ArtIndex() {
  const previews = pieces.map((p) => previewFor(p))

  return (
    <main className="mx-auto max-w-3xl px-6 pb-28 pt-28 sm:px-8 sm:pt-36">
      <PageHeader title="art / photography">a collection of things ive made</PageHeader>

      <HoverPreview previews={previews.filter((p): p is Preview => !!p)}>
        <IndexList
          accent="rose"
          items={pieces.map((p, i) => ({
            href: `/art/${p.slug}`,
            title: p.title,
            date: p.year,
            tag: p.tag && <Tag type={p.tag} />,
            preview: previews[i]?.src,
          }))}
        />
      </HoverPreview>
    </main>
  )
}
