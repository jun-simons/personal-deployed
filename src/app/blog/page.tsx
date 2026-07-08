// app/blog/page.tsx
import Link from 'next/link'
import { getAllPostMeta } from '@/app/lib/posts'
import Tag from '@/components/tag'

export default async function Blog() {
  const posts = getAllPostMeta()

  return (
    <main className="max-w-3xl mx-auto px-6 sm:px-8 py-12">
      <header className="mb-16">
        <h1 className="font-display text-5xl sm:text-6xl tracking-widest mb-6">
          posts / projects
        </h1>
        <p className="font-monoreg text-base text-neutral-700 leading-relaxed max-w-prose">
          things i&rsquo;ve built and things i&rsquo;ve written.
        </p>
      </header>

      <ul className="space-y-5">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="
                group
                flex items-baseline justify-between gap-4
                font-monoreg
                py-1
                border-b border-neutral-400/60 hover:border-green-700/60
                transition-colors
              "
            >
              <span className="text-xl group-hover:text-green-700 transition-colors truncate">
                {p.title}
              </span>
              <span className="flex items-baseline gap-3 shrink-0">
                <span className="text-sm text-neutral-600 group-hover:text-green-700/70 transition-colors tabular-nums">
                  {p.date}
                </span>
                <Tag type={p.tag} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
