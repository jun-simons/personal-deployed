import type { Metadata } from 'next'
import Link from 'next/link'
import { PerchedOwl } from '@/components/easter-eggs/owl'

export const metadata: Metadata = {
  title: 'not found',
}

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-8">
        <PerchedOwl />
      </div>
      <p className="font-display text-7xl tracking-widest sm:text-8xl">404</p>
      <p className="mt-8 font-mono text-muted">this note isn&rsquo;t on the scale.</p>
      <Link
        href="/"
        className="mt-12 font-mono text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        ← back home
      </Link>
    </main>
  )
}
