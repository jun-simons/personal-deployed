// src/app/art/pieces.ts
//
// Add a new piece by appending an entry to the `pieces` array below.
// Media files live in /public/art/ (paths are referenced as "/art/...").
//
// Media types:
//   { type: 'image', src, alt?, caption? }
//   { type: 'video', src, poster?, caption?, loop?, muted? }
//   { type: 'audio', src, caption?, cover? }

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
    slug: 'studies',
    title: 'studies',
    year: '2026',
    description:
      'A placeholder piece mixing image, video, and audio so the layout can be verified end-to-end.',
    cover: '/owl.png',
    media: [
      { type: 'image', src: '/owl.png', alt: 'owl', caption: 'owl, ink on paper' },
      { type: 'image', src: '/globe.svg', alt: 'globe', caption: 'globe study' },
      {
        type: 'video',
        src: '/art/sample.mp4',
        poster: '/owl.png',
        caption: 'motion sketch (placeholder — drop a real .mp4 at public/art/sample.mp4)',
        loop: true,
        muted: true,
      },
      {
        type: 'audio',
        src: '/art/sample.mp3',
        cover: '/owl.png',
        caption: 'field recording (placeholder — drop a real .mp3 at public/art/sample.mp3)',
      },
    ],
  },
  {
    slug: 'field-notes',
    title: 'field notes',
    year: '2025',
    description: 'Image-only placeholder piece.',
    cover: '/window.svg',
    media: [
      { type: 'image', src: '/window.svg', alt: 'window', caption: 'window' },
      { type: 'image', src: '/file.svg', alt: 'file', caption: 'file' },
      { type: 'image', src: '/globe.svg', alt: 'globe', caption: 'globe' },
    ],
  },
  {
    slug: 'catskill',
    title: 'catskill sunrises',
    year: '2026',
    description: 'Digital Photography, Fujifilm XT-50',
    cover: '/art/catskill/catskill1.jpg',
    media: [
      { type: 'image', src: '/art/catskill/catskill1.jpg', alt: 'low tide', caption: 'low tide' },
      { type: 'image', src: '/art/catskill/catskill2.jpg', alt: 'dive', caption: 'dive' },
      { type: 'image', src: '/art/catskill/catskill3.jpg', alt: 'weeds', caption: 'weeds' },
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
