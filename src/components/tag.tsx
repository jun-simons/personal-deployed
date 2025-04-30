// src/components/Tag.tsx
export interface TagProps {
    type: 'project' | 'post'
  }
  
  export default function Tag({ type }: TagProps) {
    const styles =
      type === 'project'
        ? 'bg-orange-200/50 text-orange-800'
        : 'bg-blue-200/50  text-blue-800'
  
    return (
      <span
        className={
          `w-16 text-center text-xs font-mono px-2 py-0.5 rounded-full ` +
          styles
        }
      >
        {type}
      </span>
    )
  }
  