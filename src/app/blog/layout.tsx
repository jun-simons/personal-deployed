// app/blog/layout.tsx
'use client'

import Navbar from '@/components/navbar'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* always visible immediately */}
      <Navbar visible={true} />

      {/* make room for the fixed nav */}
      <div className="pt-20">
        {children}
      </div>
    </>
  )
}

