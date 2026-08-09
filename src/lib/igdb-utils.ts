/* ============================================================
   IGDB Client-Safe Utility Helpers (Images, Formatting)
   ============================================================ */

/**
 * Build an IGDB image URL from an image_id.
 * Safe to import in both Client and Server Components.
 * Sizes: cover_small, cover_big, screenshot_med, screenshot_big, 720p, 1080p
 */
export function igdbImageUrl(
  imageId: string,
  size: "cover_small" | "cover_big" | "screenshot_med" | "screenshot_big" | "720p" | "1080p" = "cover_big"
): string {
  if (!imageId) return "";
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}
