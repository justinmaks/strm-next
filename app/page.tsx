import Link from "next/link";
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo.png"
            alt="Stream Now Logo"
            width={200}
            height={50}
            priority
          />
        </div>
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/login"
            className="px-4 py-3 text-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/register"
            className="px-4 py-3 text-center rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
