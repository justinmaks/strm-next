import { NextRequest, NextResponse } from 'next/server';
import logger from '@/app/lib/logger';
import { checkRateLimit } from '@/app/lib/rateLimit';
import { searchSchema } from '@/app/lib/validation';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
// TMDB v4 read-access tokens are JWTs (three dot-separated segments).
// v3 keys are 32-char hex. v4 must use Authorization: Bearer; v3 uses ?api_key.
const IS_BEARER_TOKEN = !!TMDB_API_KEY && TMDB_API_KEY.split('.').length === 3;

type TmdbSearchItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  overview?: string;
  vote_average?: number;
};

function getClientIp(request: NextRequest): string {
  const cf = request.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();

  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();

  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();

  return 'unknown';
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);

  if (!TMDB_API_KEY) {
    logger.error('TMDB API key missing', { ip });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000));
    logger.warn('TMDB search rate limited', { ip, retryAfter });
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(rate.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rate.resetAt / 1000)),
        },
      },
    );
  }

  try {
    const validationResult = searchSchema.safeParse({
      query: request.nextUrl.searchParams.get('query'),
      type: request.nextUrl.searchParams.get('type') ?? 'movie',
    });

    if (!validationResult.success) {
      logger.warn('TMDB search validation failed', {
        ip,
        errors: validationResult.error.flatten(),
      });

      return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
    }

    const { query, type } = validationResult.data;
    const endpoint = type === 'movie' ? 'search/movie' : 'search/tv';
    const tmdbUrl = new URL(`${TMDB_BASE_URL}/${endpoint}`);
    tmdbUrl.searchParams.set('query', query);
    tmdbUrl.searchParams.set('language', 'en-US');
    tmdbUrl.searchParams.set('page', '1');
    if (!IS_BEARER_TOKEN) {
      tmdbUrl.searchParams.set('api_key', TMDB_API_KEY);
    }

    logger.info('TMDB search request', {
      ip,
      query,
      type,
      userAgent: request.headers.get('user-agent'),
    });

    const response = await fetch(tmdbUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(IS_BEARER_TOKEN ? { Authorization: `Bearer ${TMDB_API_KEY}` } : {}),
      },
    });

    if (!response.ok) {
      logger.error('TMDB API error', { 
        ip,
        query,
        type,
        status: response.status,
        statusText: response.statusText
      });
      throw new Error('TMDB API error');
    }

    const data = await response.json();
    
    // Only send necessary data to client
    const sanitizedResults = (Array.isArray(data.results) ? (data.results as TmdbSearchItem[]) : []).map((item) => ({
      id: item.id,
      title: item.title || item.name || 'Untitled',
      poster_path: item.poster_path ?? null,
      release_date: item.release_date || item.first_air_date || null,
      overview: item.overview || '',
      vote_average: typeof item.vote_average === 'number' ? item.vote_average : 0,
    }));

    logger.info('TMDB search successful', { 
      ip,
      query,
      type,
      resultCount: sanitizedResults.length
    });

    return NextResponse.json({ results: sanitizedResults });
  } catch (error) {
    logger.error('TMDB search failed', { 
      ip,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 
