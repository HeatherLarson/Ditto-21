import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { DITTO_RELAYS } from '@/lib/appRelays';

/** Heather's pubkey for featured bookmarks on the landing page. */
const FEATURED_BOOKMARKS_PUBKEY = '9fce3aea32b35637838fb45b75be32595742e16bb3e4742cc82bb3d50f9087e6';

/** Heather's npub for linking to profile. */
export const FEATURED_BOOKMARKS_NPUB = 'npub1nl8r463jkdtr0qu0k3dht03jt9t59cttk0j8gtxg9wea2russlnq2zf9d0';

/** Parsed bookmark set with metadata. */
export interface BookmarkSet {
  /** The d-tag identifier. */
  id: string;
  /** Display title from the title tag. */
  title: string;
  /** Optional description. */
  description?: string;
  /** Optional image URL. */
  image?: string;
  /** Number of bookmarked items in this set. */
  itemCount: number;
  /** The raw event. */
  event: NostrEvent;
}

/**
 * Hook to fetch NIP-51 bookmark sets (kind 30003) from the featured curator.
 * Returns the categorized bookmark folders with their metadata.
 */
export function useFeaturedBookmarkSets() {
  const { nostr } = useNostr();

  return useQuery<BookmarkSet[]>({
    queryKey: ['featured-bookmark-sets', FEATURED_BOOKMARKS_PUBKEY],
    queryFn: async ({ signal }) => {
      const ditto = nostr.group(DITTO_RELAYS);

      // Fetch all bookmark sets (kind 30003) from the curator
      const bookmarkSets = await ditto.query(
        [{
          kinds: [30003],
          authors: [FEATURED_BOOKMARKS_PUBKEY],
          limit: 20,
        }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) },
      );

      if (bookmarkSets.length === 0) return [];

      // Parse each bookmark set into a structured object
      const sets: BookmarkSet[] = bookmarkSets.map((event) => {
        const dTag = event.tags.find(([name]) => name === 'd')?.[1] ?? '';
        const title = event.tags.find(([name]) => name === 'title')?.[1] ?? (dTag || 'Untitled');
        const description = event.tags.find(([name]) => name === 'description')?.[1];
        const image = event.tags.find(([name]) => name === 'image')?.[1];
        
        // Count bookmarked items (e tags for notes, a tags for articles/addressable events)
        const itemCount = event.tags.filter(([name]) => name === 'e' || name === 'a').length;

        return {
          id: dTag,
          title,
          description,
          image,
          itemCount,
          event,
        };
      });

      // Sort by most recently updated (newest first)
      sets.sort((a, b) => b.event.created_at - a.event.created_at);

      return sets;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

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
