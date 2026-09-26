// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { marked } from 'marked'
import { getAllPostMeta, getPost } from '@/app/lib/posts'
import Tag from '@/components/tag'

marked.setOptions({
  gfm: true,
  breaks: true, // treat single newlines as <br>
})

type Params = { params: Promise<{ slug: string }> }

// every post is known at build time; anything else is a 404
export const dynamicParams = false

export function generateStaticParams() {
  return getAllPostMeta().map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const { data } = getPost(slug)
  return { title: data.title }
}

export default async function Post({ params }: Params) {
  const { slug } = await params
  const { content } = getPost(slug)
  const meta = getAllPostMeta().find((p) => p.slug === slug)!
  const html = await marked(content)

  return (
    <main className="mx-auto max-w-2xl px-6 pb-28 pt-28 sm:px-8 sm:pt-36">
      <Link
        href="/blog"
        className="font-mono text-sm text-muted transition-colors hover:text-green-700"
      >
        ← posts / projects
      </Link>

      <header className="mb-12 mt-10">
        <h1 className="font-monoreg text-3xl leading-tight sm:text-4xl">{meta.title}</h1>
        <p className="mt-5 flex items-center gap-3 font-mono text-sm text-muted">
          <time dateTime={meta.date} className="tabular-nums">
            {meta.date}
          </time>
          <Tag type={meta.tag} />
        </p>
      </header>

      <article
        className="prose font-monoreg prose-p:leading-relaxed prose-li:my-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  )
}
