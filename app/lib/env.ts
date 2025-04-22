export function validateEnv() {
  const required = ['TMDB_API_KEY', 'JWT_SECRET'];
  
  for (const var_name of required) {
    if (!process.env[var_name]) {
      throw new Error(`Missing required environment variable: ${var_name}`);
    }
  }
} 