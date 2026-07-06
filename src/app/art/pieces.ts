// src/app/art/pieces.ts
//
// Media is hosted on Cloudflare R2 (bucket: js-photos), served via the
// public r2.dev subdomain. The base URL can be overridden via the
// NEXT_PUBLIC_ART_BASE_URL env var — useful when swapping to a custom
// domain later without touching any entries below.
//
// Media types:
//   { type: 'image', src, alt?, caption? }
//   { type: 'video', src, poster?, caption?, loop?, muted? }
//   { type: 'audio', src, caption?, cover? }

const R2_BASE =
  process.env.NEXT_PUBLIC_ART_BASE_URL ??
  'https://pub-bb04075bc6114410b857851b2068ad83.r2.dev'

/** Build a full media URL from a bucket key like `maine/Dive.jpg`. */
export function art(key: string): string {
  return `${R2_BASE}/${key.replace(/^\//, '')}`
}

export type MediaItem =
  | {
      type: 'image'
      src: string
      alt?: string
      caption?: string
    }
  | {
      type: 'video'
      src: string
      poster?: string
      caption?: string
      loop?: boolean
      muted?: boolean
    }
  | {
      type: 'audio'
      src: string
      caption?: string
      cover?: string
    }

export type Piece = {
  slug: string
  title: string
  year?: string
  description?: string
  cover?: string // reserved for future hover-preview on the index
  media: MediaItem[]
}

export const pieces: Piece[] = [
  {
    slug: 'catskills',
    title: 'catskills',
    year: '2025',
    description: 'photographs from the catskills.',
    cover: art('catskills/stillness.jpg'),
    media: [
      { type: 'image', src: art('catskills/stillness.jpg'), alt: 'stillness' },
      { type: 'image', src: art('catskills/DSCF3168.jpg'), alt: '' },
      { type: 'image', src: art('catskills/DSCF3177.jpg'), alt: '' },
      { type: 'image', src: art('catskills/DSCF3252.jpg'), alt: '' },
      { type: 'image', src: art('catskills/DSCF3321.jpg'), alt: '' },
    ],
  },
  {
    slug: 'maine',
    title: 'maine',
    year: '2025',
    description: 'photographs from a trip to maine.',
    cover: art('maine/Dive.jpg'),
    media: [
      { type: 'image', src: art('maine/Dive.jpg'), alt: 'dive' },
      { type: 'image', src: art('maine/LowTide.jpg'), alt: 'low tide' },
      { type: 'image', src: art('maine/Weeds.jpg'), alt: 'weeds' },
    ],
  },
  {
    slug: 'catskill',
    title: 'catskill sunrises',
    year: '2026',
    description: 'Digital Photography, Fujifilm XT-50',
    cover: '/art/catskill/catskill1.jpg',
    media: [
      { type: 'image', src: '/art/catskill/catskill1.jpg', alt: 'low tide', caption: 'winter \'25, hunter mountain' },
      { type: 'image', src: '/art/catskill/catskill2.jpg', alt: 'dive', caption: 'winter \'25, hunter mountain' },
      { type: 'image', src: '/art/catskill/catskill3.jpg', alt: 'weeds', caption: 'spring \'26, mt tremper' },
      { type: 'image', src: '/art/catskill/stillness.jpg', alt: 'weeds', caption: 'stillness in the hut' },
    ],
  },
  {
    slug: 'maine',
    title: 'maine',
    year: '2022',
    description: 'Digital Photography, Nikon D850',
    cover: '/art/LowTide.jpg',
    media: [
      { type: 'image', src: '/art/LowTide.jpg', alt: 'low tide', caption: 'low tide' },
      { type: 'image', src: '/art/Dive.jpg', alt: 'dive', caption: 'dive' },
      { type: 'image', src: '/art/Weeds.jpg', alt: 'weeds', caption: 'weeds' },
    ],
  },
  

]

export function getPiece(slug: string): Piece | undefined {
  return pieces.find((p) => p.slug === slug)
}
