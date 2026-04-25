'use client';

import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder,
  isLoading = false,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery || disabled || isLoading) {
      return;
    }

    onSearch(nextQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-none sm:max-w-3xl">
      <div className="surface-card-strong flex flex-col gap-3 rounded-[1.5rem] p-3 sm:flex-row sm:items-center sm:rounded-[1.75rem]">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1rem] bg-surface-input px-4 py-3 sm:rounded-[1.2rem]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 shrink-0 text-muted"
          >
            <path
              d="M21 21l-4.35-4.35m1.6-5.15a7.75 7.75 0 11-15.5 0 7.75 7.75 0 0115.5 0z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || 'Search...'}
            disabled={disabled || isLoading}
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={disabled || isLoading}
          className="inline-flex h-[3.25rem] w-full items-center justify-center rounded-[1rem] bg-accent px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_var(--glow)] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:w-auto sm:min-w-36 sm:rounded-[1.2rem]"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <p className="mt-3 px-1 text-sm text-muted">
        Tip: start with a movie title and year for tighter TMDB results.
      </p>
    </form>
  );
}; 
