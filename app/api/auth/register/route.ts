import { NextRequest, NextResponse } from 'next/server';
import { createUser, hashPassword } from '@/app/lib/auth';
import { registerSchema } from '@/app/lib/validation';
import logger from '@/app/lib/logger';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  try {
    const body = await request.json();
    
    // Log registration attempt
    logger.info('Registration attempt', { 
      ip,
      username: body.username,
      email: body.email,
      userAgent: request.headers.get('user-agent')
    });
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Registration validation failed', { 
        ip,
        username: body.username,
        email: body.email,
        errors: validationResult.error.format()
      });
      
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { username, email, password } = validationResult.data;
    
    // Create user
    const userId = await createUser(username, email, password, ip);
    
    if (!userId) {
      logger.warn('Registration failed - username or email already exists', { 
        ip,
        username,
        email
      });
      
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }
    
    // Log successful registration
    logger.info('Registration successful', { 
      ip,
      username,
      email,
      userId
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration successful',
        user: {
          id: userId,
          username,
        }
      }
    );
  } catch (error) {
    logger.error('Registration error', { 
      ip,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
} 