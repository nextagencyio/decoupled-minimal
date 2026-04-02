import Image from 'next/image'
import { getImageUrl, getAspectRatio, type ImageSize } from '@/lib/image-utils'

interface DrupalImage {
  url: string
  alt?: string
  width?: number
  height?: number
  variations?: { name: string; url: string; width: number; height: number }[]
}

interface ResponsiveImageProps {
  image: DrupalImage
  alt?: string
  className?: string
  priority?: boolean
  sizes?: string
  preferredSize?: ImageSize
  aspectRatioFallback?: string
  maxHeight?: string
  width?: number
  height?: number
  context?: 'hero' | 'teaser' | 'thumbnail' | 'full'
}

export default function ResponsiveImage({
  image,
  alt,
  className = '',
  priority = false,
  sizes,
  preferredSize,
  aspectRatioFallback = '16/9',
  maxHeight,
  width,
  height,
  context = 'full',
}: ResponsiveImageProps) {
  if (!image?.url) {
    return null
  }

  const imageAlt = alt || image.alt || ''

  const contextDefaults = {
    hero: { sizes: '(max-width: 768px) 100vw, 832px', preferredSize: 'LARGE' as ImageSize },
    teaser: { sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw', preferredSize: 'LARGE' as ImageSize },
    thumbnail: { sizes: '(max-width: 768px) 50vw, 25vw', preferredSize: 'THUMBNAIL' as ImageSize },
    full: { sizes: '100vw', preferredSize: 'LARGE' as ImageSize },
  }

  const finalSizes = sizes || contextDefaults[context].sizes
  const finalPreferredSize = preferredSize || contextDefaults[context].preferredSize
  const aspectRatio = getAspectRatio(image, finalPreferredSize) || aspectRatioFallback

  if (width && height) {
    return (
      <Image
        src={getImageUrl(image, finalPreferredSize, context)}
        alt={imageAlt}
        width={width}
        height={height}
        className={`object-cover ${className}`}
        sizes={finalSizes}
        priority={priority}
        placeholder="empty"
      />
    )
  }

  return (
    <div
      className={`relative w-full bg-gray-50 ${className}`}
      style={{
        aspectRatio,
        maxHeight: maxHeight || undefined
      }}
    >
      <Image
        src={getImageUrl(image, finalPreferredSize, context)}
        alt={imageAlt}
        fill
        className="object-cover"
        sizes={finalSizes}
        priority={priority}
        placeholder="empty"
      />
    </div>
  )
}
