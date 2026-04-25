'use client';

import { availableSources, buildEmbedUrl } from '@/app/lib/embedSources';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

export default function WebPlayer() {
  const params = useParams<{ type: string; id: string }>();
  const typeParam = params?.type ?? 'movie';
  const idParam = params?.id ?? '';

  if (typeParam !== 'movie') {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="surface-card max-w-xl rounded-[2rem] p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent-cool">
            Not ready yet
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-foreground">
            TV playback is still being rebuilt.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Search is public now, but episodic navigation needs a dedicated season and episode flow before it comes back.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:bg-foreground/90"
          >
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  if (!/^\d+$/.test(idParam)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="surface-card max-w-xl rounded-[2rem] p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent-cool">
            Invalid title
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-foreground">
            That movie ID doesn’t look right.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Movie IDs are numeric. Head back to search and pick a title from the results.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:bg-foreground/90"
          >
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return <MoviePlayer key={idParam} idParam={idParam} />;
}

function MoviePlayer({ idParam }: { idParam: string }) {
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
    <div className="relative min-h-screen overflow-hidden bg-[#071018] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,74,0.18),_transparent_28rem),radial-gradient(circle_at_right,_rgba(31,122,140,0.2),_transparent_26rem)]" />

      <header className="absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/12 bg-black/35 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md transition hover:bg-black/50"
        >
          <span aria-hidden="true">←</span>
          Back to search
        </Link>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="rounded-full border border-white/12 bg-black/35 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/75 backdrop-blur-md">
            TMDB {idParam}
          </div>
          <div className="rounded-full border border-white/12 bg-black/35 px-4 py-2 text-sm text-white/80 backdrop-blur-md">
            {currentIndex >= 0 ? `${currentIndex + 1} / ${availableSources.length}` : 'Preparing'}
          </div>
        </div>
      </header>

      {!selectedSrc && (
        <div className="flex h-screen max-h-screen w-full items-center justify-center px-6">
          <div className="surface-card w-full max-w-xl rounded-[2rem] px-8 py-10 text-center text-foreground">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent-cool">
              Auto source selection
            </p>
            <div className="mx-auto mt-6 h-10 w-10 rounded-full border-2 border-foreground/15 border-t-accent animate-spin" />
            <p className="mt-6 font-display text-3xl font-semibold tracking-[-0.04em] text-foreground">
              {statusText}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              The player is checking curated providers and will open the first server that responds.
            </p>
            {currentIndex >= 0 && (
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-muted">
                {currentIndex + 1} / {availableSources.length}
              </p>
            )}
            <div ref={probeContainerRef} className="hidden" />
            {failedAll && (
              <p className="mt-4 text-sm text-red-700">No server responded. Refresh or try a different title.</p>
            )}
          </div>
        </div>
      )}

      {selectedSrc && (
        <div className="relative h-screen max-h-screen w-full pt-20 sm:pt-24">
          <iframe
            key={currentIndex}
            src={selectedSrc}
            className="h-full w-full"
            allowFullScreen
            allow="autoplay; fullscreen"
            referrerPolicy="no-referrer"
          />

          <div className="absolute left-4 top-24 z-10 flex flex-wrap items-center gap-2 rounded-[1.2rem] border border-white/12 bg-black/50 px-3 py-3 text-white backdrop-blur-md sm:left-6 sm:top-28">
            <span className="text-xs uppercase tracking-[0.2em] text-white/70">
              Server: {currentIndex >= 0 ? availableSources[currentIndex]?.name : 'Unknown'}
            </span>
            <button
              type="button"
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
              onClick={() => {
                const nextIndex = (currentIndex + 1) % availableSources.length;
                setCurrentIndex(nextIndex);
                setStatusText(`Using ${availableSources[nextIndex].name}`);
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
