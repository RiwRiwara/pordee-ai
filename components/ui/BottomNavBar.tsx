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

  return (
    <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-gray-200 bg-yellow-400">
      <div className="mx-auto grid h-full max-w-lg grid-cols-3">
        <Link
          href="/dashboard"
          className={`group inline-flex flex-col items-center justify-center ${pathname === '/dashboard' ? 'text-primary' : 'text-gray-700'
            }`}
        >
          <svg
            className="mb-1 h-6 w-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5z"></path>
            <path d="M11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
          <span className="text-sm">หน้าหลัก</span>
        </Link>

        <Link
          href="/calendar"
          className={`group inline-flex flex-col items-center justify-center ${pathname === '/calendar' ? 'text-primary' : 'text-gray-700'
            }`}
        >
          <svg
            className="mb-1 h-6 w-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
          </svg>
          <span className="text-sm">ปฏิทิน</span>
        </Link>

        <div
          onClick={() => {
            if (isGuestMode && !isAuthenticated) {
              showNotification(
                'ต้องเข้าสู่ระบบก่อน',
                'กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์ของคุณ',
                'flat',
                'success'
              );
              router.push('/auth/login');
            } else {
              router.push('/profile');
            }
          }}
          className={`group inline-flex cursor-pointer flex-col items-center justify-center ${(
            pathname === '/profile' ? 'text-primary' : 'text-gray-700'
          )}`}
        >
          <svg
            className="mb-1 h-6 w-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
          </svg>
          <span className="text-sm">โปรไฟล์</span>
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;
