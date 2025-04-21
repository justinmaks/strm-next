export interface User {
  id: number;
  username: string;
  email: string;
  password: string; // Note: This is the hashed password, never expose this to frontend
  created_at: string;
  last_login: string | null;
  last_ip: string | null;
}

export interface SafeUser {
  id: number;
  username: string;
  // No password or sensitive information
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: SafeUser;
  error?: string;
} 