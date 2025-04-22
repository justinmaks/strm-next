import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import db from './db';
import { headers } from 'next/headers';
import type { User } from './types';

// JWT secret (should be in env variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d'; // 7 days

const ACTIVE_SESSIONS = new Map();

// Get IP address with fallback for proxies
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  
  // Try Cloudflare headers first
  const cfConnectingIp = headersList.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;
  
  // Try X-Forwarded-For which is common for proxies
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // Extract the first IP which should be the client
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }
  
  // Try X-Real-IP header next (used by nginx)
  const realIp = headersList.get('x-real-ip');
  if (realIp) return realIp;
  
  // Fallback to remote address (may be unavailable in Next.js 13+)
  return '0.0.0.0'; // Unable to determine IP
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Verify a password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create a JWT token
export function createToken(userId: number, username: string): string {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// Set auth token in a cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: true, // Always use secure in production
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'strict',
    domain: process.env.COOKIE_DOMAIN, // Set this in production
  });
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

// Get the current authenticated user from a token
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Record a login
export function recordLogin(userId: number, ip: string) {
  db.prepare(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP, last_ip = ? WHERE id = ?'
  ).run(ip, userId);
}

// Create a new user
export async function createUser(username: string, email: string, password: string, ip: string) {
  const hashedPassword = await hashPassword(password);
  
  try {
    // Check if username or email already exists
    const existingUser = getUserByUsername(username) || getUserByEmail(email);
    if (existingUser) {
      return null;
    }

    const result = db.prepare(
      'INSERT INTO users (username, email, password, last_ip, last_login) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).run(username, email, hashedPassword, ip);
    
    return result.lastInsertRowid;
  } catch (error) {
    console.error('Database error during user creation:', error);
    throw error;
  }
}

// Get user by username
export function getUserByUsername(username: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
}

// Get user by email
export function getUserByEmail(email: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

// Get user by id
export function getUserById(id: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function trackSession(userId: number, token: string) {
  const userSessions = ACTIVE_SESSIONS.get(userId) ?? new Set();
  userSessions.add(token);
  ACTIVE_SESSIONS.set(userId, userSessions);
}

export function invalidateAllSessions(userId: number) {
  ACTIVE_SESSIONS.delete(userId);
} 