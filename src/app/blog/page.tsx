// app/blog/page.tsx
import type { Metadata } from 'next'
import { getAllPostMeta } from '@/app/lib/posts'
import IndexList from '@/components/index-list'
import PageHeader from '@/components/page-header'
import Tag from '@/components/tag'

export const metadata: Metadata = {
  title: 'posts / projects',
}

export default function Blog() {
  const posts = getAllPostMeta()

  return (
    <main className="mx-auto max-w-3xl px-6 pb-28 pt-28 sm:px-8 sm:pt-36">
      <PageHeader title="posts / projects">
        things i&rsquo;ve built and things i&rsquo;ve written.
      </PageHeader>

      <IndexList
        accent="green"
        items={posts.map((p) => ({
          href: `/blog/${p.slug}`,
          title: p.title,
          date: p.date,
          tag: <Tag type={p.tag} />,
        }))}
      />
    </main>
  )
}
