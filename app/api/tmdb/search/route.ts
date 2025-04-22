import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import logger from '@/app/lib/logger';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Add authentication check
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    logger.warn('TMDB search attempt without token', { ip });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET!) as { userId: number; username: string };
    logger.info('TMDB search request', { 
      ip,
      userId: decoded.userId,
      username: decoded.username
    });
  } catch (error) {
    logger.warn('TMDB search with invalid token', { ip });
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const type = searchParams.get('type');

  if (!query || !type) {
    logger.warn('TMDB search missing parameters', { 
      ip,
      query,
      type
    });
    return NextResponse.json({ error: 'Missing query or type parameter' }, { status: 400 });
  }

  if (!TMDB_API_KEY) {
    logger.error('TMDB API key missing', { ip });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  try {
    const endpoint = type === 'movie' ? 'search/movie' : 'search/tv';
    const response = await fetch(
      `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`,
      { 
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      logger.error('TMDB API error', { 
        ip,
        status: response.status,
        statusText: response.statusText
      });
      throw new Error('TMDB API error');
    }

    const data = await response.json();
    
    // Only send necessary data to client
    const sanitizedResults = data.results.map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      release_date: item.release_date || item.first_air_date,
      overview: item.overview
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