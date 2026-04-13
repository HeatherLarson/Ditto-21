import { Link } from 'react-router-dom';
import { Music, Film, Clapperboard, Podcast } from 'lucide-react';

import { DittoLogo } from '@/components/DittoLogo';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/hooks/useAppContext';

interface LandingHeroProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function LandingHero({ onLoginClick, onSignupClick }: LandingHeroProps) {
  const { config } = useAppContext();

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

      {/* ── Music & Video Features ── */}
      <div className="px-4 pb-5 landing-hero-fade" style={{ animationDelay: '200ms' }}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Discover
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
