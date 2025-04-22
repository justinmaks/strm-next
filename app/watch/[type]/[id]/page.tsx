'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function WebPlayer() {
  const params = useParams();
  const { type, id } = params;

  // Only show player for movies currently
  if (type !== 'movie') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">This content type is not supported yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full h-screen max-h-screen">
        <iframe
          src={`https://embed.su/embed/movie/${id}`}
          className="w-full h-full"
          allowFullScreen
          allow="fullscreen"
        />
      </div>
    </div>
  );
} 