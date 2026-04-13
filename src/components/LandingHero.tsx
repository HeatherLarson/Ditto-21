import { Link } from 'react-router-dom';
import { Music, Film, Clapperboard, Podcast } from 'lucide-react';

import { DittoLogo } from '@/components/DittoLogo';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/components/NoteCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/hooks/useAppContext';
import { useFeaturedMedia } from '@/hooks/useFeaturedMedia';

interface LandingHeroProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

function NoteCardSkeleton() {
  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full shrink-0" />
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export function LandingHero({ onLoginClick, onSignupClick }: LandingHeroProps) {
  const { config } = useAppContext();
  const { data: featuredContent, isLoading } = useFeaturedMedia(10);

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

      {/* ── Quick Links to Content Types ── */}
      <div className="px-4 pb-5 landing-hero-fade" style={{ animationDelay: '200ms' }}>
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

      {/* ── Featured Content from Music-Obsessed Creators ── */}
      <div className="landing-hero-fade" style={{ animationDelay: '280ms' }}>
        <div className="px-4 py-3 border-y border-border bg-card/30">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Featured
          </p>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredContent && featuredContent.length > 0 ? (
          <div>
            {featuredContent.map((event) => (
              <NoteCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            No featured content available
          </div>
        )}
      </div>

      {/* ── Divider into feed ── */}
      <div className="border-b border-border" />
    </div>
  );
}
