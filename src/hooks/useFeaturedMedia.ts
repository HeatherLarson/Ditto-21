import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { DITTO_RELAYS } from '@/lib/appRelays';

/** Featured music-obsessed npubs whose content we want to highlight. */
export const FEATURED_PUBKEYS = [
  '12c41114d90ecd0193d2036f2c454dbd1cbb2c33996d20533c0b5cd03f486cf5', // new music nudge unit
  'eeb11961b25442b16389fe6c7ebea9adf0ac36dd596816ea7119e521b8821b9e',
  '56cadbc821999f0385267ef6d3dfba1098774b3a033a610e9f23f894ff580022', // tunestr
  '28ca019b78b494c25a9da2d645975a8501c7e99b11302e5cbe748ee593fcb2cc',
  '8806372af51515bf4aef807291b96487ea1826c966a5596bca86697b5d8b23bc',
  '4ce6abbd68dab6e9fdf6e8e9912a8e12f9b539e078c634c55a9bff2994a514dd',
  '8c8f7ae3356bfcb0bff7ab11ac69d26adb87ab1d914f6479f06457750bb58f91',
  '5c7794d47115a1b133a19673d57346ca494d367379458d8e98bf24a498abc46b',
  '312d00fab4860c967c98bb4585971ab1bef9475d51b4becbc9f313f968403f2b',
];

/** Music and video kinds to feature. */
const FEATURED_KINDS = [
  36787, // Music Tracks
  34139, // Music Playlists
  21,    // Videos (NIP-71)
  22,    // Short Videos (NIP-71)
  34236, // Divines
  30054, // Podcast Episodes
  30055, // Podcast Trailers
];

/**
 * Fetches recent music and video content from featured creators.
 * Used to populate the hero section with highlighted media.
 */
export function useFeaturedMedia(limit = 6) {
  const { nostr } = useNostr();

  return useQuery<NostrEvent[]>({
    queryKey: ['featured-media', limit],
    queryFn: async ({ signal }) => {
      const ditto = nostr.group(DITTO_RELAYS);
      const events = await ditto.query(
        [{
          kinds: FEATURED_KINDS,
          authors: FEATURED_PUBKEYS,
          limit: limit * 2, // Fetch extra to account for filtering
        }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) },
      );
      
      // Return the most recent events, limited to the requested amount
      return events.slice(0, limit);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
