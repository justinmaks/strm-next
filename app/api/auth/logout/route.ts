import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  // Clear the auth cookie
  clearAuthCookie();

  return NextResponse.json(
    { success: true, message: 'Logged out successfully' }
  );
} 