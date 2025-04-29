'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Skip layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Left sidebar */}
      <div className="bg-blue-800 text-white w-60 flex flex-col shadow-lg">
        <div className="h-16 flex items-center px-6 border-b border-blue-700">
          <h1 className="text-xl font-bold">Pordee Admin</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <Link
                href="/admin"
                className={`flex items-center rounded-md px-4 py-3 ${pathname === '/admin' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>แดชบอร์ด</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className={`flex items-center rounded-md px-4 py-3 ${pathname.startsWith('/admin/users') ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>จัดการผู้ใช้</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/debts"
                className={`flex items-center rounded-md px-4 py-3 ${pathname.startsWith('/admin/debts') ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span>จัดการหนี้</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-blue-700">
          <Link
            href="/"
            className="flex items-center text-blue-200 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white h-16 border-b flex items-center justify-between px-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {pathname === '/admin' && 'แดชบอร์ดผู้ดูแล'}
              {pathname.startsWith('/admin/users') && 'จัดการผู้ใช้'}
              {pathname.startsWith('/admin/debts') && 'จัดการข้อมูลหนี้'}
            </h2>
          </div>
          <div>
            <Link 
              href="/admin/login"
              className="rounded-md bg-red-50 border border-red-200 px-4 py-1.5 text-sm text-red-600 hover:bg-red-100 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zM2 4a2 2 0 012-2h5.586a1 1 0 01.707.293l6 6A1 1 0 0117 9v7a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              ออกจากระบบ
            </Link>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
