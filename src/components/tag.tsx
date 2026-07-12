// src/components/Tag.tsx
export type TagType = 'project' | 'post' | 'photography' | 'generative'

export interface TagProps {
  type: TagType
}

const styles: Record<TagType, string> = {
  // light-theme tags (used on /blog)
  project: 'bg-orange-200/50 text-orange-800',
  post: 'bg-blue-200/50 text-blue-800',
  // dark-theme tags (used on /art)
  photography: 'bg-amber-500/15 text-amber-300',
  generative: 'bg-violet-500/20 text-violet-300',
}

export default function Tag({ type }: TagProps) {
  return (
    <span
      className={
        `inline-block min-w-16 text-center text-xs font-mono px-2 py-0.5 rounded-full ` +
        styles[type]
      }
    >
      {type}
    </span>
  )
}
