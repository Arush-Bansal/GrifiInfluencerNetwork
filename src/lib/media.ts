/**
 * Utility to extract a thumbnail URL from common social media video URLs (Instagram, TikTok, YouTube).
 * Uses public OEmbed endpoints or known URL patterns.
 */
export async function extractReelThumbnail(url: string): Promise<string | null> {
  if (!url) return null;

  try {
    // 1. Instagram Pattern
    // Reels usually look like: https://www.instagram.com/reels/ABC123XYZ/
    const igMatch = url.match(/instagram\.com\/(?:reels|p|reel)\/([a-zA-Z0-9_-]+)/);
    if (igMatch) {
      // Instagram provides a public thumbnail endpoint
      return `https://www.instagram.com/p/${igMatch[1]}/media/?size=l`;
    }

    // 2. YouTube Pattern
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    }

    // 3. Fallback: NoEmbed (supports TikTok and others)
    // TikTok usually needs oEmbed to get a thumbnail without scraping.
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.thumbnail_url) {
        return data.thumbnail_url;
      }
    }
  } catch (error) {
    console.error("Error extracting thumbnail:", error);
  }

  return null;
}
