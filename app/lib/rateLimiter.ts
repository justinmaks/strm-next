import { NextRequest } from 'next/server';

interface RateLimitData {
  count: number;
  resetTime: number;
  blockedUntil: number | null;
}

// Store rate limit data in memory (in production, you might want to use Redis)
const rateLimitStore = new Map<string, RateLimitData>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  let data = rateLimitStore.get(ip);

  // Initialize or reset data if needed
  if (!data || now > data.resetTime) {
    data = {
      count: 0,
      resetTime: now + WINDOW_MS,
      blockedUntil: null,
    };
    rateLimitStore.set(ip, data);
  }

  // Check if IP is blocked
  if (data.blockedUntil && now < data.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.blockedUntil,
    };
  }

  // Reset block if it has expired
  if (data.blockedUntil && now >= data.blockedUntil) {
    data.blockedUntil = null;
    data.count = 0;
    data.resetTime = now + WINDOW_MS;
  }

  // Increment attempt count
  data.count++;

  // Block if attempts exceeded
  if (data.count > MAX_ATTEMPTS) {
    data.blockedUntil = now + BLOCK_DURATION;
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.blockedUntil,
    };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - data.count,
    resetTime: data.resetTime,
  };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime && (!data.blockedUntil || now > data.blockedUntil)) {
      rateLimitStore.delete(ip);
    }
  }
}, 60 * 1000); // Run cleanup every minute 