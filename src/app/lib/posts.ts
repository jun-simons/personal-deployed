// src/app/lib/posts.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const POSTS_DIR = path.join(
  process.cwd(),
  'src',
  'app',
  'blog',
  'posts'
)

export type PostMeta = {
  title: string
  date:  string
  slug:  string
  tag:   'project' | 'post'
}

export function getAllPostMeta(): PostMeta[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const { data } = matter(
        fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
      )
      const rawTag = data.tag as string
      const tag = (rawTag === 'project' ? 'project' : 'post') as
        | 'project'
        | 'post'
      return {
        title: data.title,
        date:  data.date,
        slug,
        tag,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getPost(slug: string) {
  const file = fs.readFileSync(
    path.join(POSTS_DIR, `${slug}.md`),
    'utf8'
  )
  return matter(file)
}
