import { NextRequest, NextResponse } from 'next/server';
import { createUser, getClientIp, getUserByEmail, getUserByUsername } from '@/app/lib/auth';
import { registerSchema } from '@/app/lib/validation';
import { verify } from 'hcaptcha';

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
  try {
    const body = await request.json();
    const { username, email, password, captchaToken } = body;

    // Verify captcha first
    const captchaResult = await verify(
      process.env.HCAPTCHA_SECRET_KEY!,
      captchaToken
    );

    if (!captchaResult.success) {
      return NextResponse.json(
        { error: 'Invalid captcha' },
        { status: 400 }
      );
    }

    // Parse and validate the request body
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Destructure validated data
    const { username: validatedUsername, email: validatedEmail, password: validatedPassword } = validationResult.data;
    
    // Check if username already exists
    const existingUsername = getUserByUsername(validatedUsername) as User | undefined;
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }
    
    // Check if email already exists
    const existingEmail = getUserByEmail(validatedEmail) as User | undefined;
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    // Get client IP address
    const ip = await getClientIp();
    
    // Create the user
    const userId = await createUser(validatedUsername, validatedEmail, validatedPassword, ip);
    
    return NextResponse.json(
      { success: true, userId, message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
} 