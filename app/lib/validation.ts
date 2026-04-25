import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().trim().min(2).max(100),
  type: z.enum(['movie', 'tv']).default('movie'),
});
export type SearchInput = z.infer<typeof searchSchema>;
