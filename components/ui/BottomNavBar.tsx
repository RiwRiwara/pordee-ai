'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGuest } from '@/context/GuestContext';
import { useAuth } from '@/context/AuthContext';
import { useCustomToast } from '@/components/ui/ToastNotification';

const BottomNavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isGuestMode } = useGuest();
  const { isAuthenticated } = useAuth();
  const { showNotification } = useCustomToast();

  // Helper function to determine active state
  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 z-50 h-20 w-full border-t border-gray-200 bg-yellow-400 rounded-t-3xl">
      {/* Top border indicator - darker line */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-black rounded-full opacity-50"></div>
      
      <div className="mx-auto grid h-full max-w-lg grid-cols-3 pt-2">
        {/* Dashboard / Wallet */}
        <Link
          href="/dashboard"
          className="group flex flex-col items-center justify-center"
        >
          <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${isActive('/dashboard') ? 'border-2 border-black' : ''}`}>
            <svg 
              className={`w-7 h-7 ${isActive('/dashboard') ? 'text-black' : 'text-gray-700'}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18" />
              <path d="M15 16h2" />
            </svg>
          </div>
        </Link>

        {/* Calendar */}
        <Link
          href="/calendar"
          className="group flex flex-col items-center justify-center"
        >
          <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${isActive('/calendar') ? 'border-2 border-black' : ''}`}>
            <svg 
              className={`w-7 h-7 ${isActive('/calendar') ? 'text-black' : 'text-gray-700'}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
            </svg>
          </div>
        </Link>

        {/* Profile */}
        <div
          onClick={() => {
            if (isGuestMode) {
              // Redirect to login for guest users
              router.push('/auth/login');
            } else if (isAuthenticated) {
              // Redirect to profile for authenticated users
              router.push('/profile');
            } else {
              // Show notification for edge cases
              showNotification(
                'กรุณาเข้าสู่ระบบ',
                'คุณจำเป็นต้องเข้าสู่ระบบเพื่อดูโปรไฟล์',
                'flat',
                'warning',
              );
              router.push('/auth/login');
            }
          }}
          className="group flex flex-col items-center justify-center cursor-pointer"
        >
          <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${isActive('/profile') ? 'border-2 border-black' : ''}`}>
            <svg 
              className={`w-7 h-7 ${isActive('/profile') ? 'text-black' : 'text-gray-700'}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21v-2a7 7 0 0 0-14 0v2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;
