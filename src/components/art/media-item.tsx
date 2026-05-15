// src/components/art/media-item.tsx
import type { MediaItem as MediaItemType } from '@/app/art/pieces'

interface MediaItemProps {
  item: MediaItemType
}

export default function MediaItem({ item }: MediaItemProps) {
  return (
    <figure
      className="
        snap-center shrink-0
        h-full
        flex flex-col items-center justify-center
        px-6 sm:px-12
        gap-4
      "
    >
      <div className="flex-1 min-h-0 flex items-center justify-center">
        {item.type === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.alt ?? ''}
            className="max-h-full max-w-[80vw] w-auto h-auto object-contain select-none"
            draggable={false}
          />
        )}

        {item.type === 'video' && (
          <video
            src={item.src}
            poster={item.poster}
            controls
            playsInline
            loop={item.loop ?? true}
            muted={item.muted ?? true}
            className="max-h-full max-w-[80vw] w-auto h-auto object-contain"
          />
        )}

        {item.type === 'audio' && (
          <div className="flex flex-col items-center gap-6 max-w-[80vw]">
            {item.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.cover}
                alt=""
                className="max-h-[60vh] w-auto object-contain opacity-90"
                draggable={false}
              />
            )}
            <audio src={item.src} controls className="w-80 max-w-full" />
          </div>
        )}
      </div>

      {item.caption && (
        <figcaption className="font-monoreg text-sm text-neutral-400 text-center max-w-[80vw]">
          {item.caption}
        </figcaption>
      )}
    </figure>
  )
}
