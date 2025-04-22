'use client';

import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { MediaResults } from './MediaResults';

type MediaType = 'movie' | 'tv';

export const MediaSearch: React.FC = () => {
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim() || !mediaType) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tmdb/search?type=${mediaType}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setMediaType('movie')}
          className={`px-6 py-2 rounded-lg ${
            mediaType === 'movie'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Movies
        </button>
        <button
          onClick={() => setMediaType('tv')}
          className={`px-6 py-2 rounded-lg ${
            mediaType === 'tv'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          TV Shows
        </button>
      </div>

      {mediaType && (
        <div className="space-y-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder={`Search for ${mediaType === 'movie' ? 'movies' : 'TV shows'}...`}
          />
          <MediaResults results={searchResults} isLoading={isLoading} mediaType={mediaType} />
        </div>
      )}
    </div>
  );
}; 