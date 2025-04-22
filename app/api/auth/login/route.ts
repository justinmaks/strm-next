import { NextRequest, NextResponse } from 'next/server';
import { 
  createToken, 
  getClientIp, 
  getUserByUsername, 
  recordLogin, 
  setAuthCookie, 
  verifyPassword 
} from '@/app/lib/auth';
import { loginSchema } from '@/app/lib/validation';
import { checkRateLimit } from '@/app/lib/rateLimiter';
import logger from '@/app/lib/logger';

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  created_at: string;
  last_login: string | null;
  last_ip: string | null;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  try {
    // Check rate limit
    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded', { 
        ip,
        remaining: rateLimit.remaining,
        resetTime: new Date(rateLimit.resetTime).toISOString()
      });
      
      return NextResponse.json(
        { 
          error: 'Too many login attempts',
          message: `Please try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60)} minutes`
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    
    // Log login attempt
    logger.info('Login attempt', { 
      ip,
      username: body.username,
      userAgent: request.headers.get('user-agent')
    });
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Login validation failed', { 
        ip,
        username: body.username,
        errors: validationResult.error.format()
      });
      
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Destructure validated data
    const { username, password } = validationResult.data;
    
    // Get the user
    const user = getUserByUsername(username) as User | undefined;
    if (!user) {
      logger.warn('Login failed - user not found', { 
        ip,
        username
      });
      
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      logger.warn('Login failed - invalid password', { 
        ip,
        username,
        userId: user.id
      });
      
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Get client IP address
    const clientIp = await getClientIp();
    
    // Record login
    recordLogin(user.id, clientIp);
    
    // Create and set JWT token
    const token = createToken(user.id, user.username);
    await setAuthCookie(token);
    
    // Log successful login
    logger.info('Login successful', { 
      ip,
      username,
      userId: user.id,
      lastLogin: user.last_login
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
        }
      }
    );
  } catch (error) {
    logger.error('Login error', { 
      ip,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
} 