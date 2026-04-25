'use client';

import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { MediaResults } from './MediaResults';

type MediaType = 'movie' | 'tv';
type MediaResult = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string;
  vote_average: number;
};

export const MediaSearch: React.FC = () => {
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      return;
    }

    setErrorMessage('');
    setSearchQuery(query);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tmdb/search?type=${mediaType}&query=${encodeURIComponent(query)}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      setSearchResults([]);
      setErrorMessage(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent-cool">
            Discover
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-foreground">
            Search the catalog
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Movies are streaming now. TV is on the way once episode selection lands.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
        <button
            type="button"
          onClick={() => setMediaType('movie')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            mediaType === 'movie'
                ? 'bg-foreground text-white shadow-sm'
                : 'surface-card-strong text-foreground/80'
          }`}
        >
          Movies
        </button>
        <button
            type="button"
            disabled
            className="rounded-full border border-dashed border-line px-4 py-2 text-sm font-semibold text-muted"
        >
            TV Soon
        </button>
      </div>
      </div>

      <div className="space-y-4">
          <SearchBar
            onSearch={handleSearch}
          placeholder="Try: Dune Part Two, Sinners, or Interstellar"
          isLoading={isLoading}
          />

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-900">
            {errorMessage}
          </div>
        ) : null}

        <MediaResults
          results={searchResults}
          isLoading={isLoading}
          mediaType={mediaType}
          query={searchQuery}
        />
      </div>
    </section>
  );
};
