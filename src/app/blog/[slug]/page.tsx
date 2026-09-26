// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { Marked } from 'marked'
import markedKatex from 'marked-katex-extension'
import 'katex/dist/katex.min.css'
import { getAllPostMeta, getPost } from '@/app/lib/posts'
import Tag from '@/components/tag'

// Math is rendered to HTML at build time, so readers don't download KaTeX's
// JavaScript, just its stylesheet and fonts. Inline math is $...$, display
// math is $$...$$ (on its own lines). A bad formula shows as red source text
// instead of breaking the build.
const markdown = new Marked(
  {
    gfm: true,
    breaks: true, // treat single newlines as <br>
  },
  markedKatex({ throwOnError: false })
)

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
  const html = await markdown.parse(content)

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
