import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { DITTO_RELAYS } from '@/lib/appRelays';

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
 * Global media feed: latest music, videos, podcasts, and photos from all of Nostr.
 * No author filtering - shows content from everyone.
 * Standard NIP-01 reverse-chronological pagination.
 *
 * @param enabled - Whether the query should run.
 */
export function useCuratedDittoFeed(_authors: string[] | undefined, enabled: boolean) {
  const { nostr } = useNostr();

  return useInfiniteQuery<NostrEvent[], Error>({
    queryKey: ['global-media-feed'],
    queryFn: async ({ pageParam, signal }) => {
      const filter: Record<string, unknown> = {
        kinds: CURATED_KINDS,
        limit: 30,
      };
      if (pageParam) filter.until = pageParam;

      const ditto = nostr.group(DITTO_RELAYS);
      return ditto.query(
        [filter] as Parameters<typeof ditto.query>[0],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) },
      );
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
