import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { DITTO_RELAYS } from '@/lib/appRelays';

/** Heather's pubkey for featured bookmarks on the landing page. */
const FEATURED_BOOKMARKS_PUBKEY = '9fce3aea32b35637838fb45b75be32595742e16bb3e4742cc82bb3d50f9087e6';

/**
 * Hook to fetch bookmarks from a featured curator for the landing page.
 * Queries the kind 10003 bookmark list and resolves the bookmarked events.
 */
export function useFeaturedBookmarks(limit = 6) {
  const { nostr } = useNostr();

  return useQuery<NostrEvent[]>({
    queryKey: ['featured-bookmarks', FEATURED_BOOKMARKS_PUBKEY, limit],
    queryFn: async ({ signal }) => {
      const ditto = nostr.group(DITTO_RELAYS);

      // Fetch the bookmark list (kind 10003)
      const bookmarkLists = await ditto.query(
        [{
          kinds: [10003],
          authors: [FEATURED_BOOKMARKS_PUBKEY],
          limit: 1,
        }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) },
      );

      if (bookmarkLists.length === 0) return [];

      const bookmarkList = bookmarkLists[0];

      // Extract bookmarked event IDs from e tags
      const bookmarkedIds = bookmarkList.tags
        .filter(([name]) => name === 'e')
        .map(([, id]) => id)
        .slice(-limit * 2); // Take recent bookmarks (last in list = most recent)

      if (bookmarkedIds.length === 0) return [];

      // Fetch the actual bookmarked events
      const events = await ditto.query(
        [{
          ids: bookmarkedIds,
          limit: bookmarkedIds.length,
        }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) },
      );

      // Sort to match bookmark order (most recently bookmarked first — last in tags = most recent)
      const idOrder = [...bookmarkedIds].reverse();
      const sorted = events.sort((a, b) => {
        const aIdx = idOrder.indexOf(a.id);
        const bIdx = idOrder.indexOf(b.id);
        return aIdx - bIdx;
      });

      return sorted.slice(0, limit);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
