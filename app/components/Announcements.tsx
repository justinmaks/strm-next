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
        return 'border-cyan-200 bg-cyan-50/70 text-cyan-900';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/80 text-yellow-900';
      case 'success':
        return 'border-emerald-200 bg-emerald-50/80 text-emerald-900';
      case 'error':
        return 'border-red-200 bg-red-50/80 text-red-900';
      default:
        return 'border-cyan-200 bg-cyan-50/70 text-cyan-900';
    }
  };

  return (
    <div className="space-y-4">
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`rounded-2xl border px-4 py-4 shadow-sm ${getTypeStyles(announcement.type)}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] opacity-70">
                Notice
              </p>
              <p className="mt-2 text-sm leading-6">{announcement.message}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDismiss(announcement.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/10 text-current/60 transition hover:bg-white/70 hover:text-current"
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
