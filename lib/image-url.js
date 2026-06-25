/**
 * Returns a usable image URL.
 * - Local paths (/uploads/..., /companions/...) are returned as-is
 * - Unsplash URLs are returned as-is (they support hotlinking)
 * - Other external URLs are proxied through /api/image-proxy to avoid hotlink blocking
 */
export function getImageUrl(url) {
  if (!url) return null

  // Local paths — no proxy needed
  if (url.startsWith('/')) return url

  // Unsplash allows hotlinking
  if (url.includes('images.unsplash.com')) return url

  // Everything else gets proxied
  return `/api/image-proxy?url=${encodeURIComponent(url)}`
}
