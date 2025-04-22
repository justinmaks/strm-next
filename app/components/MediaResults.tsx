'use client';

import React from 'react';

interface MediaResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  overview: string;
}

interface MediaResultsProps {
  results: MediaResult[];
  isLoading: boolean;
  mediaType: 'movie' | 'tv';
}

export const MediaResults: React.FC<MediaResultsProps> = ({
  results,
  isLoading,
  mediaType,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return <p className="text-center text-gray-500">No results found</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {item.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              alt={item.title || item.name}
              className="w-full h-[300px] object-cover"
            />
          ) : (
            <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">
              {mediaType === 'movie' ? item.title : item.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {mediaType === 'movie'
                ? item.release_date?.split('-')[0]
                : item.first_air_date?.split('-')[0]}
            </p>
            <p className="text-sm text-gray-500 line-clamp-3">{item.overview}</p>
          </div>
        </div>
      ))}
    </div>
  );
}; 