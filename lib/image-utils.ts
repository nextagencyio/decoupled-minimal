interface DrupalImage {
  url: string
  alt?: string
  width?: number
  height?: number
  variations?: { name: string; url: string; width: number; height: number }[]
}

export type ImageSize = 'THUMBNAIL' | 'MEDIUM' | 'LARGE'

/**
 * Convert a Drupal absolute URL to a proxied URL
 */
function proxyDrupalUrl(url: string): string {
  if (!url) return '';

  const drupalBaseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;
  if (!drupalBaseUrl || !url.startsWith(drupalBaseUrl)) {
    return url; // Return as-is if not a Drupal URL
  }

  // Extract the path after the Drupal base URL (should be /sites/...)
  const path = url.substring(drupalBaseUrl.length + 1); // +1 to remove leading slash

  // Return the path directly - Next.js rewrites will handle the proxying
  return `/${path}`;
}

/**
 * Get the best image URL for a given size preference
 */
export function getImageUrl(
  image: DrupalImage,
  preferredSize: ImageSize = 'MEDIUM',
  context: 'hero' | 'teaser' | 'thumbnail' | 'full' = 'full'
): string {
  if (!image) return ''

  // For hero contexts, balance quality vs file size
  if (context === 'hero' && preferredSize === 'LARGE') {
    const largeVariation = image.variations?.find(v => v.name === 'LARGE')
    if (largeVariation && largeVariation.width && largeVariation.width >= 1200) {
      return proxyDrupalUrl(largeVariation.url)
    }
    return proxyDrupalUrl(image.url)
  }

  return proxyDrupalUrl(image.url)
}

/**
 * Get image dimensions for a given size preference
 */
export function getImageDimensions(
  image: DrupalImage,
  preferredSize: ImageSize = 'MEDIUM'
): { width: number; height: number } | null {
  if (!image) return null

  const preferredVariation = image.variations?.find(v => v.name === preferredSize)
  if (preferredVariation) {
    return {
      width: preferredVariation.width,
      height: preferredVariation.height
    }
  }

  if (image.width && image.height) {
    return {
      width: image.width,
      height: image.height
    }
  }

  return null
}

/**
 * Get the aspect ratio for an image
 */
export function getAspectRatio(
  image: DrupalImage,
  preferredSize: ImageSize = 'MEDIUM'
): number | null {
  const dimensions = getImageDimensions(image, preferredSize)
  if (!dimensions) return null

  return dimensions.width / dimensions.height
}
