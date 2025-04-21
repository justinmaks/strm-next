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
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
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
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Get client IP address
    const ip = await getClientIp();
    
    // Record login
    recordLogin(user.id, ip);
    
    // Create and set JWT token
    const token = createToken(user.id, user.username);
    await setAuthCookie(token);
    
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
} 