'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGuest } from '@/context/GuestContext';
import { useAuth } from '@/context/AuthContext';
import { useCustomToast } from '@/components/ui/ToastNotification';
import { IoWalletOutline, IoPersonCircle } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";

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

      <div className="mx-auto grid h-full max-w-lg grid-cols-3">
        {/* Dashboard / Wallet */}
        <Link
          href="/dashboard"
          className="group flex flex-col items-center justify-center"
        >
          <div className={`w-12 h-12 rounded-full  flex items-center justify-center ${isActive('/dashboard') ? ' bg-white' : ''}`}>
            <IoWalletOutline className={`w-7 h-7 ${isActive('/dashboard') ? 'text-black' : 'text-gray-700'}`} />
          </div>
        </Link>

        {/* Calendar */}
        <Link
          href="/planning"
          className="group flex flex-col items-center justify-center"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive('/planning') ? ' bg-white' : ''}`}>
            <SlCalender className={`w-7 h-7 ${isActive('/planning') ? 'text-black' : 'text-gray-700'}`} />
          </div>
        </Link>

        {/* Profile */}
        <div
          onClick={() => {
            console.log('Profile click - Auth state:', { isAuthenticated, isGuestMode });
            if (isAuthenticated) {
              // Redirect to profile for authenticated users
              router.push('/profile');
            } else if (isGuestMode) {
              // Redirect to login for guest users
              router.push('/auth/login');
            } else {
              // Show notification for edge cases (like loading state)
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
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive('/profile') ? ' bg-white' : ''}`}>
            <IoPersonCircle className={`w-7 h-7 ${isActive('/profile') ? 'text-black' : 'text-gray-700'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;
