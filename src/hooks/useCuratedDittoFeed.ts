import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { DITTO_RELAYS } from '@/lib/appRelays';

/**
 * Diverse kinds for the Ditto feed: a variety of content types for an engaging experience.
 * Includes posts, articles, media, social content, and more.
 */
const CURATED_KINDS = [
  // Core content
  1,     // Text notes (posts)
  30023, // Articles (long-form content)
  // Media - Music & Audio
  36787, // Music Tracks
  34139, // Music Playlists
  30054, // Podcast Episodes
  30055, // Podcast Trailers
  // Media - Video
  21,    // Videos (NIP-71)
  22,    // Short Videos (NIP-71)
  34236, // Divines (addressable short videos)
  // Media - Photos
  20,    // Photos (NIP-68)
  // Social & Interactive
  1068,  // Polls
  31923, // Calendar Events (NIP-52)
  31922, // Date-based Calendar Events
  39089, // Follow Packs
  // Fun & Creative
  3367,  // Color Moments
  37381, // Magic Decks
  30030, // Emoji Packs
];

/**
 * Global diverse feed: a variety of content types from across Nostr.
 * Uses hot sorting for quality content discovery.
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

      // Query global content with hot sorting for quality
      const globalFilter: Record<string, unknown> = {
        kinds: CURATED_KINDS,
        limit: 40,
        search: 'sort:hot protocol:nostr',
      };
      if (pageParam) globalFilter.until = pageParam;

      const events = await ditto.query(
        [globalFilter] as Parameters<typeof ditto.query>[0],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) },
      );

      // Deduplicate and sort by timestamp
      const seen = new Set<string>();
      const dedupedEvents: NostrEvent[] = [];

      for (const event of events) {
        if (seen.has(event.id)) continue;
        seen.add(event.id);
        dedupedEvents.push(event);
      }

      // Sort by timestamp (newest first) - hot sorting already done by relay
      dedupedEvents.sort((a, b) => b.created_at - a.created_at);

      return dedupedEvents;
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

/** Media-only kinds for dedicated media components. */
export const MEDIA_KINDS = [
  36787, // Music Tracks
  34139, // Music Playlists
  30054, // Podcast Episodes
  30055, // Podcast Trailers
  21,    // Videos (NIP-71)
  22,    // Short Videos (NIP-71)
  34236, // Divines (addressable short videos)
  20,    // Photos (NIP-68)
];
