// src/app/art/layout.tsx
'use client'

import Navbar from '@/components/navbar'

// Re-skin via CSS vars: the Navbar (and any child using `bg-background` /
// inherited text color) inherits these from the wrapper, even though the
// nav itself is `position: fixed`.
const artTheme: React.CSSProperties = {
  // dark-but-warm so it reads as "different room" rather than just inverted
  ['--background' as string]: '#0d0d0f',
  ['--foreground' as string]: '#ededed',
}

export default function ArtLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={artTheme}
      className="bg-background text-foreground h-screen overflow-hidden"
    >
      <Navbar visible={true} />
      <div className="pt-20 h-screen overflow-y-auto">{children}</div>
    </div>
  )
}
