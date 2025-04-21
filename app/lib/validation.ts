import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50)
    .refine(value => /^[a-zA-Z0-9_-]+$/.test(value), {
      message: 'Username can only contain letters, numbers, underscores, and hyphens',
    }),
  email: z.string().email(),
  password: z.string().min(8)
    .refine(value => {
      // At least one uppercase letter, one lowercase letter, one number, and one special character
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      return hasUppercase && hasLowercase && hasNumber && hasSpecial;
    }, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>; 