import Image from 'next/image';
import Announcements from './components/Announcements';
import { MediaSearch } from './components/MediaSearch';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const activeAnnouncements = [
    {
      id: 'tv-coming',
      message: 'Movies are live. TV support is being rebuilt with a dedicated season and episode flow.',
      type: 'info' as const,
    },
  ];

  const highlights = [
    {
      title: 'Always free',
      description: 'Search the full TMDB catalog and launch any title without paying, subscribing, or installing anything.',
    },
    {
      title: 'Many servers',
      description: 'Curated streaming providers are probed automatically — the player opens whichever one responds first.',
    },
    {
      title: 'Modern stack',
      description: 'Built on Next.js 16, React 19, and Tailwind 4 for a fast, clean experience on every device.',
    },
  ];

  return (
    <main className="relative overflow-hidden">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-4 sm:px-8 sm:pb-20 sm:pt-6 lg:px-10">
        <header className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="surface-card inline-flex items-center gap-3 rounded-full px-4 py-3">
            <div className="rounded-2xl bg-surface-strong p-2 shadow-sm">
              <Image
                src="/images/logo.png"
                alt="Stream Now Logo"
                width={108}
                height={28}
                priority
              />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-accent-strong">
                STRM NOW
              </p>
              <p className="text-sm text-muted">Free streaming search</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="surface-card rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/80 sm:text-sm sm:normal-case sm:tracking-normal">
              Free streaming
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-start lg:gap-10">
          <div className="order-2 flex flex-col justify-center lg:order-1">
            <p className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.32em] text-accent-cool">
              Free, fast, simple
            </p>
            <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[0.94] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
              Search a movie, pick a server, and start streaming.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:mt-6 sm:text-xl sm:leading-8">
              Browse the full TMDB catalog, jump straight into the player, and let automatic server fallback handle the
              rest. Every title, free to watch.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
              <div className="surface-card rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/80 sm:text-sm sm:normal-case sm:tracking-normal">
                TMDB-powered search
              </div>
              <div className="surface-card rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/80 sm:text-sm sm:normal-case sm:tracking-normal">
                Multiple stream sources
              </div>
              <div className="surface-card rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/80 sm:text-sm sm:normal-case sm:tracking-normal">
                Clean modern player
              </div>
            </div>
          </div>

          <div className="order-1 surface-card rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-7 lg:order-2">
            <Announcements announcements={activeAnnouncements} />
            <div className="mt-5">
              <MediaSearch />
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:mt-14 md:grid-cols-3">
          {highlights.map((item, index) => (
            <article
              key={item.title}
              className="surface-card-strong rounded-[1.75rem] p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent-cool">
                0{index + 1}
              </p>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
                {item.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
