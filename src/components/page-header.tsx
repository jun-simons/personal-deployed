// src/components/page-header.tsx
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  children?: ReactNode
}

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="mb-14 sm:mb-20">
      <h1 className="font-display text-[2.6rem] leading-none tracking-widest sm:text-6xl">
        {title}
      </h1>
      {children && (
        <p className="mt-6 max-w-prose font-mono text-base leading-relaxed text-muted">
          {children}
        </p>
      )}
    </header>
  )
}
