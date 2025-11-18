// ============================================================================
// app/yoto-icons.ts - Fetch and cache Yoto emoji icon URLs
// ============================================================================

import { supabase } from './cache';

interface YotoIcon {
  displayIconId: string;
  url: string;
}

// Cache icon URLs in memory (persists during server runtime)
const iconUrlCache = new Map<string, string>();

/**
 * Fetch icon URL from Yoto API using the icon hash ID
 * Caches results to avoid repeated API calls
 */
export async function getYotoIconUrl(
  iconId: string,
  accessToken?: string
): Promise<string | null> {
  // Check cache first
  if (iconUrlCache.has(iconId)) {
    return iconUrlCache.get(iconId)!;
  }

  try {
    // Use provided token or fallback to environment variable
    const token = accessToken || process.env.YOTO_ACCESS_TOKEN;

    if (!token) {
      console.error('No Yoto access token available for fetching icon URLs');
      return null;
    }

    // Fetch public icons from Yoto API
    const response = await fetch('https://api.yotoplay.com/media/displayIcons/user/yoto', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch Yoto icons:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const icons: YotoIcon[] = data.displayIcons || [];

    // Cache all icon URLs for future use
    for (const icon of icons) {
      iconUrlCache.set(icon.displayIconId, icon.url);
    }

    console.log(`Cached ${icons.length} Yoto icon URLs`);

    // Return the requested icon URL
    return iconUrlCache.get(iconId) || null;
  } catch (error) {
    console.error('Error fetching Yoto icon URLs:', error);
    return null;
  }
}

/**
 * Extract the hash ID from a yoto:#HASH format string
 */
export function extractIconHash(yotoIconId: string): string {
  return yotoIconId.replace('yoto:#', '');
}
