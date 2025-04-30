// app/blog/[slug]/page.tsx
import { getAllPostMeta, getPost } from '@/app/lib/posts'
import { marked } from 'marked'

marked.setOptions({
  gfm:     true,
  breaks:  true,      // ← treat single newlines as <br>
})

export async function generateStaticParams() {
  return getAllPostMeta().map(({ slug }) => ({ slug }))
}

export default async function Post({
  params,
  }: {
  // params isPromise of params 
  params: Promise<{ slug: string }>
  }) {
  // await the Promise to get the real slug
  const { slug } = await params
  const { data, content } = getPost(slug)
  return (
    <main className="max-w-3xl mx-auto px-16 py-16">
      <h1 className="text-4xl font-monoreg font-semibold mb-4">{data.title}</h1>
      <article
        className="prose font-monoreg"
        dangerouslySetInnerHTML={{ __html: marked(content) }}
      />
    </main>
  )
}

