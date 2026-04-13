import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Film, Clapperboard, Podcast, Play, Pause } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

import { DittoLogo } from '@/components/DittoLogo';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/hooks/useAppContext';
import { useFeaturedMedia } from '@/hooks/useFeaturedMedia';
import { useAuthor } from '@/hooks/useAuthor';
import { useAudioPlayer } from '@/contexts/audioPlayerContextDef';
import { parseMusicTrack, toAudioTrack } from '@/lib/musicHelpers';
import { cn } from '@/lib/utils';

interface LandingHeroProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

/** Get a tag value by name. */
function getTag(tags: string[][], name: string): string | undefined {
  return tags.find(([n]) => n === name)?.[1];
}

/** Parse video/divine artwork from imeta tags. */
function parseVideoArtwork(event: NostrEvent): string | undefined {
  for (const tag of event.tags) {
    if (tag[0] !== 'imeta') continue;
    for (let i = 1; i < tag.length; i++) {
      const p = tag[i];
      if (p.startsWith('image ')) return p.slice(6);
      if (p.startsWith('thumb ')) return p.slice(6);
    }
  }
  return getTag(event.tags, 'thumb') ?? getTag(event.tags, 'image');
}

/** Compact featured media card for the hero section. */
function FeaturedMediaCard({ event }: { event: NostrEvent }) {
  const navigate = useNavigate();
  const player = useAudioPlayer();
  const author = useAuthor(event.pubkey);

  const isMusic = event.kind === 36787;
  const isPlaylist = event.kind === 34139;
  const isVideo = event.kind === 21 || event.kind === 22;
  const isDivine = event.kind === 34236;
  const isPodcast = event.kind === 30054 || event.kind === 30055;

  const parsed = useMemo(() => {
    if (isMusic) return parseMusicTrack(event);
    return null;
  }, [event, isMusic]);

  const title = useMemo(() => {
    if (parsed?.title) return parsed.title;
    return getTag(event.tags, 'title') ?? getTag(event.tags, 'subject') ?? getTag(event.tags, 'd') ?? 'Untitled';
  }, [event, parsed]);

  const artwork = useMemo(() => {
    if (parsed?.artwork) return parsed.artwork;
    if (isVideo || isDivine) return parseVideoArtwork(event);
    return getTag(event.tags, 'image') ?? getTag(event.tags, 'thumb');
  }, [event, parsed, isVideo, isDivine]);

  const isNowPlaying = player.currentTrack?.id === event.id;
  const isAudioPlayable = isMusic || isPodcast;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMusic || !parsed) return;
    
    if (isNowPlaying && player.isPlaying) {
      player.pause();
    } else if (isNowPlaying) {
      player.resume();
    } else {
      const track = toAudioTrack(event, parsed);
      track.artwork ??= author.data?.metadata?.picture;
      player.playTrack(track);
    }
  };

  const handleClick = () => {
    // Navigate to the event detail page
    const dTag = getTag(event.tags, 'd');
    if (dTag && event.kind >= 30000) {
      const naddr = nip19.naddrEncode({ kind: event.kind, pubkey: event.pubkey, identifier: dTag });
      navigate(`/${naddr}`);
    } else {
      const nevent = nip19.neventEncode({ id: event.id, author: event.pubkey });
      navigate(`/${nevent}`);
    }
  };

  const KindIcon = isMusic ? Music : isPlaylist ? Music : isVideo ? Film : isDivine ? Clapperboard : Podcast;

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative flex-shrink-0 w-[140px] rounded-xl overflow-hidden cursor-pointer transition-all',
        'border border-border/50 hover:border-primary/40',
        isNowPlaying && 'border-primary ring-1 ring-primary/30',
      )}
    >
      {/* Artwork */}
      <div className="relative aspect-square bg-card overflow-hidden">
        {artwork ? (
          <img
            src={artwork}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <KindIcon className="size-10 text-primary/30" />
          </div>
        )}

        {/* Play button overlay for audio content */}
        {isAudioPlayable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
            <button
              onClick={handlePlay}
              className={cn(
                'size-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100',
                isNowPlaying && player.isPlaying
                  ? 'bg-primary text-primary-foreground opacity-100'
                  : 'bg-white/90 text-black hover:bg-white',
              )}
            >
              {isNowPlaying && player.isPlaying ? (
                <Pause className="size-4" fill="currentColor" />
              ) : (
                <Play className="size-4 ml-0.5" fill="currentColor" />
              )}
            </button>
          </div>
        )}

        {/* Kind badge */}
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium flex items-center gap-1">
          <KindIcon className="size-3" />
          {isMusic ? 'Track' : isPlaylist ? 'Playlist' : isVideo ? 'Video' : isDivine ? 'Divine' : 'Podcast'}
        </div>
      </div>

      {/* Title */}
      <div className="p-2">
        <p className="text-xs font-medium truncate">{title}</p>
        {parsed?.artist && (
          <p className="text-[10px] text-muted-foreground truncate">{parsed.artist}</p>
        )}
      </div>
    </div>
  );
}

/** Loading skeleton for featured media cards. */
function FeaturedMediaSkeleton() {
  return (
    <div className="flex-shrink-0 w-[140px] rounded-xl overflow-hidden border border-border/50">
      <Skeleton className="aspect-square w-full" />
      <div className="p-2 space-y-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  );
}

export function LandingHero({ onLoginClick, onSignupClick }: LandingHeroProps) {
  const { config } = useAppContext();
  const { data: featuredMedia, isLoading } = useFeaturedMedia(8);

  return (
    <div className="landing-hero">
      {/* ── Hero Header ── */}
      <div className="px-4 pt-8 pb-6 text-center space-y-4">
        <div className="flex justify-center landing-hero-fade" style={{ animationDelay: '0ms' }}>
          <DittoLogo size={56} />
        </div>

        <div className="space-y-2 landing-hero-fade" style={{ animationDelay: '80ms' }}>
          <h1 className="text-2xl sidebar:text-3xl font-bold tracking-tight">
            {config.appName}
          </h1>
          <p className="text-muted-foreground text-sm sidebar:text-base max-w-xs mx-auto leading-relaxed">
            Discover music, videos, and podcasts on Nostr
          </p>
        </div>

        <div className="flex gap-3 justify-center landing-hero-fade" style={{ animationDelay: '160ms' }}>
          <Button onClick={onSignupClick} className="rounded-full px-6" size="sm">
            Sign up
          </Button>
          <Button onClick={onLoginClick} variant="outline" className="rounded-full px-6" size="sm">
            Log in
          </Button>
          <Button variant="outline" className="rounded-full px-6" size="sm" asChild>
            <Link to="/help">FAQ</Link>
          </Button>
        </div>
      </div>

      {/* ── Featured Media from Music-Obsessed Creators ── */}
      <div className="pb-5 landing-hero-fade" style={{ animationDelay: '200ms' }}>
        <div className="px-4 mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Featured
          </p>
          <Link
            to="/music"
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Browse all
          </Link>
        </div>

        {/* Horizontal scrolling media cards */}
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none scroll-smooth pb-1">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <FeaturedMediaSkeleton key={i} />)
          ) : featuredMedia && featuredMedia.length > 0 ? (
            featuredMedia.map((event) => (
              <FeaturedMediaCard key={event.id} event={event} />
            ))
          ) : (
            // Fallback if no featured media
            Array.from({ length: 4 }).map((_, i) => <FeaturedMediaSkeleton key={i} />)
          )}
        </div>
      </div>

      {/* ── Quick Links to Content Types ── */}
      <div className="px-4 pb-5 landing-hero-fade" style={{ animationDelay: '280ms' }}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Explore
        </p>
        <div className="grid grid-cols-2 gap-2 sidebar:grid-cols-4">
          <Link
            to="/music"
            className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card transition-all"
          >
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Music className="size-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">Music</span>
          </Link>
          <Link
            to="/videos"
            className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card transition-all"
          >
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Film className="size-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">Videos</span>
          </Link>
          <Link
            to="/vines"
            className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card transition-all"
          >
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Clapperboard className="size-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">Divines</span>
          </Link>
          <Link
            to="/podcasts"
            className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card transition-all"
          >
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Podcast className="size-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">Podcasts</span>
          </Link>
        </div>
      </div>

      {/* ── Divider into feed ── */}
      <div className="border-b border-border" />
    </div>
  );
}
