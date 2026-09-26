// src/components/contact-view.tsx
'use client'

import { useState } from 'react'
import PageHeader from '@/components/page-header'
import Theremin from '@/components/instruments/theremin'

const EMAIL = 'jdsimons017@gmail.com'

const ELSEWHERE = [
  { label: 'linkedin', href: 'https://www.linkedin.com/in/jun-simons/' },
  { label: 'github', href: 'https://github.com/jun-simons' },
]

const link =
  'underline decoration-rule decoration-1 underline-offset-[6px] transition-colors hover:text-orange-500 hover:decoration-orange-500'

export default function ContactView() {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard can be unavailable (insecure context, permissions); the
      // mailto link still works, so just do nothing
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-28 sm:px-8 sm:pt-36">
      <PageHeader title="contact">say hi &#x263A;</PageHeader>

      <dl className="space-y-10">
        <div>
          <dt className="mb-2 font-mono text-sm text-muted">email</dt>
          <dd className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-monoreg text-lg sm:text-xl">
            <a href={`mailto:${EMAIL}`} className={`${link} break-all`}>
              {EMAIL}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="font-mono text-sm text-muted transition-colors hover:text-orange-500"
            >
              <span aria-live="polite">{copied ? 'copied ✓' : 'copy'}</span>
            </button>
          </dd>
        </div>

        <div>
          <dt className="mb-2 font-mono text-sm text-muted">elsewhere</dt>
          <dd>
            <ul className="flex flex-wrap gap-x-8 gap-y-2 font-monoreg text-lg sm:text-xl">
              {ELSEWHERE.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className={link}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <section aria-label="Theremin" className="mt-20">
        <Theremin />
      </section>
    </main>
  )
}
