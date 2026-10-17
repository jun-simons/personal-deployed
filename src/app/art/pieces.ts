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

export type PieceTag = 'photography' | 'generative'

export type Piece = {
  slug: string
  title: string
  year?: string
  tag?: PieceTag
  /** Short caption, always shown under the title on the piece's page. */
  description?: string
  /** Longer write-up, printed on a label on the "back" of the piece when the
   *  about button is pressed. One per piece (not per slide); leave a blank line
   *  between paragraphs. No `about` = no button. */
  about?: string
  media: MediaItem[]
}

export type Preview = { kind: 'image' | 'video'; src: string }

/** What /art floats beside the cursor on hover: the piece's first slide. */
export function previewFor(piece: Piece): Preview | undefined {
  const first = piece.media[0]
  if (!first) return undefined
  if (first.type === 'image') return { kind: 'image', src: first.src }
  if (first.type === 'video') {
    return first.poster ? { kind: 'image', src: first.poster } : { kind: 'video', src: first.src }
  }
  return first.cover ? { kind: 'image', src: first.cover } : undefined
}

export const pieces: Piece[] = [
  {
    slug: 'catskills',
    title: 'catskills at sunrise',
    year: '2026',
    tag: 'photography',
    description: 'digital photographs',
    about: `
    On the catskills:

    Sunrises in the catskills are unpredictable and change so quickly. Hiking up in the dark you have no clue what to expect, and only when the first glow hits the horizon
    do you know whether clouds fill the valleys, or whether wisps of fog will diffuse the sun's shape. And even after that moment, everything changes again a few times. All these pictures
    come straight out of my camera unedited, barring fujifilm's internal processing, but photos taken minutes apart can have drastically different colors.
    
    The catskills have an extra special bit of meaning to me in the context of the many artists that viewed these landscapes in the hudson river school of painting. 
    If sometimes I feel like a photograph is romanticized, maybe by nature of a selective composition, I remember how Thomas Cole's works, however idealized, have in many ways
    a greater truth in nature than a strictly faithful reproduction of the scene. I photograph while hiking rather than hike with intent to photograph,
    so its fun to capture sponetaneous moments of sunrise for a fraction of that glory.

    Fujifilm XT-50, 16-55 f2.8
    `,
    media: [
      { type: 'image', src: art('catskills/DSCF3252.jpg'), alt: 'sunrise on hunter', caption: 'hunter sunrise'},
      { type: 'image', src: art('catskills/DSCF3168.jpg'), alt: 'morning fog', caption: 'morning fog'},
      { type: 'image', src: art('catskills/DSCF3321.jpg'), alt: 'sunrise on hunter 2', caption: 'hunter sunrise 2' },
      { type: 'image', src: art('catskills/stillness.jpg'), alt: 'stillness', caption: 'stillness in the hut'},
      { type: 'image', src: art('catskills/DSCF3177.jpg'), alt: 'view from mt tremper', caption: 'from tremper'},
    ],
  },
  {
    slug: 'diffusion-1',
    title: 'diffusion 1',
    year: '2024',
    tag: 'generative',
    description: 'generative reaction-diffusion model built with C++ and openFrameworks.',
    about: `Initial iteration from generative experiments with a reaction diffusion system, modeling spread and interaction fluid organic systems. 
    A mathematical modeling and iteration engine in C++ underlies the openFrameworks rendering engine for graphics.`,
    media: [
      {
        type: 'video',
        src: art('generative/Diffusion1.mp4'),
        loop: true,
      },
    ],
  },
 {
    slug: 'transport-1',
    title: 'transport 1',
    year: '2023',
    description: 'generative biological network built with C++, openFrameworks, and SuperCollider',
    about: `Transport-1 is a generative biological network built in C++ with openFrameworks rendering.
    It was designed for live exhibition, where individual "agents" behave according to probabilistic rules, and parameters to the network can be adjusted live.



    I created the audio in SuperCollider with Supernova and SCNvim.`,
    tag: 'generative',
    media: [
      {
        type: 'video',
        src: art('generative/Transport 1.mp4'),
        loop: true,
        muted: false,
      },
    ],
  },
  {
    slug: 'maine',
    title: 'maine',
    year: '2022',
    tag: 'photography',
    description: 'digital photographs',
    about: `Digital Photographs, Nikon D850`,
    media: [
      { type: 'image', src: art('maine/LowTide.jpg'), alt: 'low tide', caption: 'low tide' },
      { type: 'image', src: art('maine/Dive.jpg'), alt: 'dive', caption: 'dive' },
      { type: 'image', src: art('maine/Weeds.jpg'), alt: 'weeds', caption: 'weeds' },
    ],
  },
]

export function getPiece(slug: string): Piece | undefined {
  return pieces.find((p) => p.slug === slug)
}
