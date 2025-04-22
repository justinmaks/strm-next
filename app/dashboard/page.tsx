import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import LogoutButton from '../components/LogoutButton';
import { MediaSearch } from '../components/MediaSearch';
import Announcements from '../components/Announcements';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Define active announcements
const activeAnnouncements = [
  {
    id: 'tv-shows-wip',
    message: 'TV Shows section is a work in progress',
    type: 'info' as const,
  },
];

export default async function DashboardPage() {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    redirect('/login');
  }
  
  // Verify and decode the token
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
  } catch (error) {
    redirect('/login');
  }
  
  // Get the username from the token
  const { username } = decodedToken;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-800">
              Welcome, <span className="font-semibold">{username}</span>!
            </p>
          </div>

          <div className="mb-6">
            <Announcements announcements={activeAnnouncements} />
          </div>

          <div className="mb-8">
            <MediaSearch />
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6 flex justify-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
} 