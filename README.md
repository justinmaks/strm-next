# Next.js Authentication System

This project implements a secure authentication system using Next.js, SQLite, and JWT.

## Features

- User registration with validation
- Secure login authentication
- Password hashing with bcrypt
- JWT-based authentication
- IP address tracking for logins
- Protected routes with middleware
- Proper error handling
- Form validation (client and server side)

## Security Features

- Password hashing with bcrypt (12 rounds)
- Secure HTTP-only cookies for JWT storage
- Input sanitization and validation using Zod
- Protection against common attacks (SQL injection via prepared statements)
- IP address detection with fallbacks for proxies (Cloudflare, Nginx)
- Password strength requirements

## Database

The application uses SQLite for storage, with the database file located in the `/data` directory.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following content:
   ```
   JWT_SECRET=your-secret-key-change-in-production
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Visit http://localhost:3000

## Routes

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard displaying welcome message
- `/api/auth/login` - Login API endpoint
- `/api/auth/register` - Registration API endpoint
- `/api/auth/logout` - Logout API endpoint

## Technologies Used

- Next.js 15.3+
- React 19+
- SQLite (via better-sqlite3)
- bcryptjs for password hashing
- jsonwebtoken for JWT tokens
- zod for validation
- TypeScript

## Deployment Considerations

When deploying to production:
1. Generate a strong JWT secret
2. Ensure data directory is properly secured
3. Consider adding rate limiting for auth endpoints
4. Set up HTTPS/TLS
5. Enable CORS protections as needed

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker Deployment

This project includes Docker support for easy deployment and development.

### Prerequisites

- Docker
- Docker Compose

### Running with Docker

1. Build and start the container:
   ```bash
   docker compose up --build
   ```

2. For production deployment:
   ```bash
   docker compose -f docker-compose.yml up -d
   ```

3. To stop the containers:
   ```bash
   docker compose down
   ```

### Docker Configuration

The project uses:
- Node.js 22.8.0
- SQLite with persistent storage
- Production-optimized build
- Health checks
- Memory limits (2GB max)

The Docker setup includes:
- Persistent SQLite database storage
- Environment variable configuration
- Automatic restarts
- Resource management
- Production-ready settings

### Docker Volumes

- `/app/data`: Contains SQLite database files
- Node modules are cached in a named volume

Remember to:
1. Set proper environment variables in production
2. Secure the data volume containing the SQLite database
3. Monitor container health and logs
4. Adjust memory limits as needed for your deployment
