'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface MediaResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string;
  vote_average: number;
}

interface MediaResultsProps {
  results: MediaResult[];
  isLoading: boolean;
  mediaType: 'movie' | 'tv';
  query: string;
}

export const MediaResults: React.FC<MediaResultsProps> = ({
  results,
  isLoading,
  mediaType,
  query,
}) => {
  const router = useRouter();

  const handleItemClick = (id: number) => {
    router.push(`/watch/${mediaType}/${id}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="surface-card-strong overflow-hidden rounded-[1.75rem] p-4"
          >
            <div className="aspect-[2/3] animate-pulse rounded-[1.25rem] bg-skeleton" />
            <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-skeleton" />
            <div className="mt-3 h-4 w-1/3 animate-pulse rounded-full bg-skeleton" />
            <div className="mt-4 space-y-2">
              <div className="h-3 animate-pulse rounded-full bg-skeleton" />
              <div className="h-3 animate-pulse rounded-full bg-skeleton" />
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-skeleton" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!query) {
    return (
      <div className="surface-card-strong rounded-[1.75rem] px-6 py-8 text-center">
        <p className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
          Start with a movie title
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Search results land here with release year, rating, poster art, and a direct jump to the player.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="surface-card-strong rounded-[1.75rem] px-6 py-8 text-center">
        <p className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
          No matches for “{query}”
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Try a shorter title, add the release year, or swap punctuation for a simpler query.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent-cool">
            Results
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-foreground">
            {results.length} match{results.length === 1 ? '' : 'es'} for “{query}”
          </h3>
        </div>
        <p className="text-sm text-muted">Tap a card to open the player.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {results.map((item) => (
          <button
          key={item.id}
            type="button"
          onClick={() => handleItemClick(item.id)}
            className="surface-card-strong group overflow-hidden rounded-[1.75rem] text-left transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_80px_-44px_rgba(24,33,47,0.55)]"
        >
            <div className="relative aspect-[2/3] overflow-hidden">
              {item.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1280px) 24rem, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,107,74,0.30),_transparent_55%),linear-gradient(135deg,_#192231,_#34445d)]">
                  <span className="font-display text-xl font-semibold tracking-[-0.03em] text-white/80">
                    No poster
                  </span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/14 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/90 backdrop-blur">
                    {item.release_date?.split('-')[0] || 'Unknown year'}
                  </span>
                  {item.vote_average > 0 ? (
                    <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur">
                      {item.vote_average.toFixed(1)} / 10
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="p-5">
              <h4 className="font-display text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {item.title}
              </h4>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
                {item.overview || 'No synopsis available for this title yet.'}
              </p>
            </div>
          </button>
      ))}
      </div>
    </div>
  );
}; 
