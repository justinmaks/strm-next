import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the type for our rate limit map
const rateLimit: Map<string, number[]> = new Map();

export function rateLimiter(request: NextRequest) {
  // Get IP from headers or connection
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') ||
             'anonymous';

  const timeFrame = 60 * 1000; // 1 minute
  const maxAttempts = 5; // 5 attempts per minute

  const now = Date.now();
  const userRequests = rateLimit.get(ip) ?? [];
  const recentRequests = userRequests.filter((time: number) => now - time < timeFrame);

  if (recentRequests.length >= maxAttempts) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return null;
} 