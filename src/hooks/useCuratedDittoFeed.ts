import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { DITTO_RELAYS } from '@/lib/appRelays';
import { FEATURED_PUBKEYS } from '@/hooks/useFeaturedMedia';

/** Curated kinds for the Ditto feed: prioritizing music, videos, divines, and podcasts. */
const CURATED_KINDS = [
  // Music & Audio - prioritized first
  36787, // Music Tracks
  34139, // Music Playlists
  30054, // Podcast Episodes
  30055, // Podcast Trailers
  // Video content
  21,    // Videos (NIP-71)
  22,    // Short Videos (NIP-71)
  34236, // Divines (addressable short videos)
  // Photos
  20,    // Photos (NIP-68)
];

/**
 * Global media feed: latest music, videos, podcasts, and photos.
 * Prioritizes content from featured creators, then shows global content.
 * Standard NIP-01 reverse-chronological pagination.
 *
 * @param enabled - Whether the query should run.
 */
export function useCuratedDittoFeed(_authors: string[] | undefined, enabled: boolean) {
  const { nostr } = useNostr();

  return useInfiniteQuery<NostrEvent[], Error>({
    queryKey: ['global-media-feed'],
    queryFn: async ({ pageParam, signal }) => {
      const ditto = nostr.group(DITTO_RELAYS);

      // Query both featured creators AND global in parallel
      const featuredFilter: Record<string, unknown> = {
        kinds: CURATED_KINDS,
        authors: FEATURED_PUBKEYS,
        limit: 20,
      };
      if (pageParam) featuredFilter.until = pageParam;

      const globalFilter: Record<string, unknown> = {
        kinds: CURATED_KINDS,
        limit: 30,
      };
      if (pageParam) globalFilter.until = pageParam;

      const events = await ditto.query(
        [featuredFilter, globalFilter] as Parameters<typeof ditto.query>[0],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) },
      );

      // Deduplicate and sort: featured creators first, then by timestamp
      const seen = new Set<string>();
      const featuredSet = new Set(FEATURED_PUBKEYS);
      const featured: NostrEvent[] = [];
      const others: NostrEvent[] = [];

      for (const event of events) {
        if (seen.has(event.id)) continue;
        seen.add(event.id);

        if (featuredSet.has(event.pubkey)) {
          featured.push(event);
        } else {
          others.push(event);
        }
      }

      // Sort each group by timestamp (newest first)
      featured.sort((a, b) => b.created_at - a.created_at);
      others.sort((a, b) => b.created_at - a.created_at);

      // Return featured content first, then others
      return [...featured, ...others];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].created_at - 1;
    },
    initialPageParam: undefined as number | undefined,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/** Re-export for use in Feed.tsx landing hero / kind lists. */
export { CURATED_KINDS };
