import type { Metadata } from 'next'
import Home from '@/components/home'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

// Tells Google what to call the site in search results
// (https://developers.google.com/search/docs/appearance/site-names).
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Jun Simons',
  alternateName: ['junsimons.com'],
  url: 'https://junsimons.com/',
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Home />
    </>
  )
}
