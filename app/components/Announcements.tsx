'use client';

import React, { useState } from 'react';

interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface AnnouncementsProps {
  announcements?: Announcement[];
}

const Announcements: React.FC<AnnouncementsProps> = ({ announcements = [] }) => {
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  if (!announcements.length) return null;

  const visibleAnnouncements = announcements.filter(
    (announcement) => !dismissedAnnouncements.includes(announcement.id)
  );

  if (!visibleAnnouncements.length) return null;

  const handleDismiss = (id: string) => {
    setDismissedAnnouncements((prev) => [...prev, id]);
  };

  const getTypeStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'info':
        return 'bg-amber-50 border-amber-500 text-amber-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      case 'success':
        return 'bg-green-50 border-green-500 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-700';
      default:
        return 'bg-amber-50 border-amber-500 text-amber-700';
    }
  };

  return (
    <div className="space-y-4">
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`border-l-4 p-4 ${getTypeStyles(announcement.type)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <p className="text-sm">{announcement.message}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDismiss(announcement.id)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Announcements; 