'use client';

import { availableSources, buildEmbedUrl } from '@/app/lib/embedSources';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

export default function WebPlayer() {
  const params = useParams<{ type: string; id: string }>();
  const typeParam = params?.type ?? 'movie';
  const idParam = params?.id ?? '';

  // Only show player for movies currently
  if (typeParam !== 'movie') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">This content type is not supported yet.</p>
      </div>
    );
  }

  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('Picking server...');
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [failedAll, setFailedAll] = useState<boolean>(false);
  const probeContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function probeSourcesSequentially() {
      for (let i = 0; i < availableSources.length; i += 1) {
        if (isCancelled) return;

        const source = availableSources[i];
        setCurrentIndex(i);
        setStatusText(`Trying ${source.name}...`);

        const url = buildEmbedUrl(source, 'movie', idParam);
        const ok = await checkIframeLoads(url, 12000, probeContainerRef.current);
        if (isCancelled) return;

        if (ok) {
          setSelectedSrc(url);
          setStatusText(`Using ${source.name}`);
          setCurrentIndex(i);
          return;
        }
      }

      if (!isCancelled) {
        setFailedAll(true);
        setStatusText('No working server found.');
      }
    }

    probeSourcesSequentially();

    return () => {
      isCancelled = true;
    };
  }, [idParam]);

  return (
    <div className="min-h-screen bg-black">
      {!selectedSrc && (
        <div className="w-full h-screen max-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <p className="text-sm opacity-80">{statusText}</p>
            {currentIndex >= 0 && (
              <p className="text-xs opacity-60">
                {currentIndex + 1} / {availableSources.length}
              </p>
            )}
            <div ref={probeContainerRef} className="hidden" />
            {failedAll && (
              <p className="text-xs text-red-400">Try again later or refresh.</p>
            )}
          </div>
        </div>
      )}

      {selectedSrc && (
        <div className="relative w-full h-screen max-h-screen">
          <iframe
            key={currentIndex}
            src={selectedSrc}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
            referrerPolicy="no-referrer"
          />

          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 bg-black/60 text-white rounded px-3 py-2">
            <span className="text-xs opacity-80">
              Server: {currentIndex >= 0 ? availableSources[currentIndex]?.name : 'Unknown'}
            </span>
            <button
              className="text-xs bg-white/10 hover:bg-white/20 rounded px-2 py-1"
              onClick={() => {
                const nextIndex = (currentIndex + 1) % availableSources.length;
                setCurrentIndex(nextIndex);
                const nextSrc = buildEmbedUrl(availableSources[nextIndex], 'movie', idParam);
                setSelectedSrc(nextSrc);
              }}
            >
              Next server
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function checkIframeLoads(
  src: string,
  timeoutMs: number,
  mountContainer: HTMLDivElement | null,
): Promise<boolean> {
  return new Promise((resolve) => {
    let finished = false;
    const cleanup = (iframe: HTMLIFrameElement, timer: ReturnType<typeof setTimeout>) => {
      clearTimeout(timer);
      try {
        iframe.onload = null;
        iframe.onerror = null;
      } catch {}
      iframe.remove();
    };

    const iframe = document.createElement('iframe');
    iframe.src = src;
    // Reduce referrer leakage/noise
    iframe.referrerPolicy = 'no-referrer';
    iframe.width = '0';
    iframe.height = '0';
    iframe.style.position = 'absolute';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      cleanup(iframe, timer);
      resolve(false);
    }, timeoutMs);

    iframe.onload = () => {
      if (finished) return;
      finished = true;
      cleanup(iframe, timer);
      resolve(true);
    };

    iframe.onerror = () => {
      if (finished) return;
      finished = true;
      cleanup(iframe, timer);
      resolve(false);
    };

    (mountContainer ?? document.body).appendChild(iframe);
  });
}