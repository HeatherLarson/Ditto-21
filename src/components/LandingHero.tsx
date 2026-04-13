import { Link } from 'react-router-dom';
import { Music, Film, Podcast, Play, Headphones, Radio, Bookmark, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteCard } from '@/components/NoteCard';
import { useAppContext } from '@/hooks/useAppContext';
import { useFeaturedBookmarks } from '@/hooks/useFeaturedBookmarks';

interface LandingHeroProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function LandingHero({ onLoginClick, onSignupClick }: LandingHeroProps) {
  const { config } = useAppContext();
  const { data: featuredBookmarks, isLoading: isLoadingBookmarks } = useFeaturedBookmarks(6);

  return (
    <div className="landing-hero relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Floating music icons - decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Music className="absolute top-[10%] left-[5%] size-8 text-primary/10 animate-pulse" style={{ animationDelay: '0s' }} />
        <Headphones className="absolute top-[20%] right-[10%] size-10 text-primary/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Radio className="absolute bottom-[30%] left-[8%] size-6 text-primary/10 animate-pulse" style={{ animationDelay: '1s' }} />
        <Play className="absolute top-[40%] right-[5%] size-7 text-primary/10 animate-pulse" style={{ animationDelay: '1.5s' }} />
        <Music className="absolute bottom-[20%] right-[15%] size-9 text-primary/10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main hero content */}
      <div className="relative z-10 px-4 pt-12 pb-10 text-center">
        {/* Big headline */}
        <div className="space-y-4 landing-hero-fade" style={{ animationDelay: '0ms' }}>
          <h1 className="text-4xl sidebar:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            {config.appName}
          </h1>
          <p className="text-xl sidebar:text-2xl font-medium text-foreground/90 max-w-md mx-auto">
            Your music. Your way.
          </p>
          <p className="text-muted-foreground text-sm sidebar:text-base max-w-sm mx-auto leading-relaxed">
            Discover independent artists, videos, and podcasts on the decentralized web
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 justify-center mt-8 landing-hero-fade" style={{ animationDelay: '100ms' }}>
          <Button onClick={onSignupClick} size="lg" className="rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
            Get Started
          </Button>
          <Button onClick={onLoginClick} variant="outline" size="lg" className="rounded-full px-8 text-base font-semibold">
            Log in
          </Button>
        </div>

        {/* Stats or social proof */}
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground landing-hero-fade" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-1.5">
            <Music className="size-4 text-primary" />
            <span>Independent Music</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Film className="size-4 text-primary" />
            <span>Videos</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Podcast className="size-4 text-primary" />
            <span>Podcasts</span>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 px-4 pb-8 landing-hero-fade" style={{ animationDelay: '300ms' }}>
        <div className="grid grid-cols-1 sidebar:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Link
            to="/music"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-primary/20 p-6 hover:border-primary/40 hover:from-pink-500/30 hover:to-purple-600/30 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
            <Music className="size-10 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-1">Music</h3>
            <p className="text-sm text-muted-foreground">Tracks and playlists from independent artists</p>
          </Link>

          <Link
            to="/videos"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-primary/20 p-6 hover:border-primary/40 hover:from-blue-500/30 hover:to-cyan-600/30 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
            <Film className="size-10 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-1">Videos</h3>
            <p className="text-sm text-muted-foreground">Music videos, live performances, and more</p>
          </Link>

          <Link
            to="/podcasts"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-primary/20 p-6 hover:border-primary/40 hover:from-orange-500/30 hover:to-red-600/30 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
            <Podcast className="size-10 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-1">Podcasts</h3>
            <p className="text-sm text-muted-foreground">Shows and episodes from creators you love</p>
          </Link>
        </div>
      </div>

      {/* Featured Bookmarks Section */}
      {(isLoadingBookmarks || (featuredBookmarks && featuredBookmarks.length > 0)) && (
        <div className="relative z-10 px-4 pb-6 landing-hero-fade" style={{ animationDelay: '400ms' }}>
          <div className="max-w-3xl mx-auto">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20">
                <Sparkles className="size-4 text-amber-500" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Heather's Picks</h2>
              <div className="flex-1 h-px bg-border/50" />
              <Link 
                to="/npub1nl8r463jkdtr0qu0k3dht03jt9t59cttk0j8gtxg9wea2russlnq2zf9d0"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Bookmark className="size-3" />
                View all
              </Link>
            </div>

            {/* Bookmarks grid/list */}
            {isLoadingBookmarks ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <div className="px-4 py-3">
                      <div className="flex gap-3">
                        <Skeleton className="size-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredBookmarks && featuredBookmarks.length > 0 ? (
              <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden divide-y divide-border/50">
                {featuredBookmarks.map((event) => (
                  <NoteCard key={event.id} event={event} compact />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Section divider with label */}
      <div className="relative z-10 px-4 py-4 border-y border-border bg-card/50 backdrop-blur-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">
          Latest from the community
        </p>
      </div>
    </div>
  );
}
