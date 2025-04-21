import { NextRequest, NextResponse } from 'next/server';
import { createUser, getClientIp, getUserByEmail, getUserByUsername } from '@/app/lib/auth';
import { registerSchema } from '@/app/lib/validation';

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
    // Parse and validate the request body
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Destructure validated data
    const { username, email, password } = validationResult.data;
    
    // Check if username already exists
    const existingUsername = getUserByUsername(username) as User | undefined;
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }
    
    // Check if email already exists
    const existingEmail = getUserByEmail(email) as User | undefined;
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    // Get client IP address
    const ip = await getClientIp();
    
    // Create the user
    const userId = await createUser(username, email, password, ip);
    
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