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

/** Build a full media URL from a bucket key like `maine/Dive.jpg`. Path
 *  segments are URL-encoded individually so filenames with spaces or other
 *  reserved characters work without the caller having to escape them. */
export function art(key: string): string {
  const encoded = key
    .replace(/^\//, '')
    .split('/')
    .map(encodeURIComponent)
    .join('/')
  return `${R2_BASE}/${encoded}`
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
    slug: 'transport-1',
    title: 'Transport 1',
    year: '2023',
    media: [
      {
        type: 'video',
        src: art('generative/Transport 1.mp4'),
        loop: true,
        muted: true,
      },
    ],
  },
]

export function getPiece(slug: string): Piece | undefined {
  return pieces.find((p) => p.slug === slug)
}
