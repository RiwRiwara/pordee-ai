'use client';

import React, { useEffect, useState } from 'react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDebts: number;
  averageDebtAmount: number;
  totalDebtAmount: number;
  recentRegistrations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDebts: 0,
    averageDebtAmount: 0,
    totalDebtAmount: 0,
    recentRegistrations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Content-Type': 'application/json',
            // Include admin key from env if available
            ...(process.env.NEXT_PUBLIC_ADMIN_API_KEY && {
              'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
            })
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        
        // Use sample data for demo purposes
        setStats({
          totalUsers: 128,
          activeUsers: 95,
          totalDebts: 367,
          averageDebtAmount: 24500.75,
          totalDebtAmount: 8991625.25,
          recentRegistrations: 12
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">กำลังโหลด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">แดชบอร์ดผู้ดูแลระบบ (Admin Dashboard)</h1>
        <p className="text-gray-600">ภาพรวมและสถิติของแอป Pordee</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="bg-blue-500 p-4 text-white">
            <h3 className="text-lg font-semibold">ผู้ใช้ (Users)</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">จำนวนผู้ใช้ทั้งหมด</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ผู้ใช้ที่ยังใช้งานอยู่</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">ลงทะเบียนใหม่ (7 วัน)</p>
              <p className="text-xl font-bold text-purple-600">+{stats.recentRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="bg-yellow-500 p-4 text-white">
            <h3 className="text-lg font-semibold">หนี้ (Debts)</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">จำนวนหนี้ทั้งหมด</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalDebts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">จำนวนหนี้เฉลี่ยต่อผู้ใช้</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalUsers > 0 ? (stats.totalDebts / stats.totalUsers).toFixed(1) : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="bg-green-500 p-4 text-white">
            <h3 className="text-lg font-semibold">ยอดรวม (Totals)</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ยอดหนี้รวมทั้งหมด</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalDebtAmount.toLocaleString()} บาท
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ยอดหนี้เฉลี่ย</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.averageDebtAmount.toLocaleString()} บาท
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin tools section */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">เครื่องมือผู้ดูแลระบบ (Admin Tools)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div 
            className="flex flex-col items-center justify-center rounded-lg bg-blue-100 p-4 shadow-sm transition-all hover:shadow-md"
            onClick={() => window.location.href = '/admin/users'}
          >
            <svg className="mb-2 h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <h3 className="text-lg font-medium text-blue-700">จัดการผู้ใช้</h3>
            <p className="text-center text-sm text-gray-600">เพิ่ม แก้ไข ลบผู้ใช้งาน</p>
          </div>

          <div 
            className="flex flex-col items-center justify-center rounded-lg bg-yellow-100 p-4 shadow-sm transition-all hover:shadow-md"
            onClick={() => window.location.href = '/admin/debts'}
          >
            <svg className="mb-2 h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-lg font-medium text-yellow-700">จัดการหนี้</h3>
            <p className="text-center text-sm text-gray-600">ดู แก้ไข ลบข้อมูลหนี้</p>
          </div>

          <div 
            className="flex flex-col items-center justify-center rounded-lg bg-green-100 p-4 shadow-sm transition-all hover:shadow-md"
            onClick={() => window.location.href = '/admin/settings'}
          >
            <svg className="mb-2 h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <h3 className="text-lg font-medium text-green-700">ตั้งค่าระบบ</h3>
            <p className="text-center text-sm text-gray-600">ตั้งค่าพื้นฐานต่างๆ</p>
          </div>

          <div 
            className="flex flex-col items-center justify-center rounded-lg bg-red-100 p-4 shadow-sm transition-all hover:shadow-md"
            onClick={() => window.location.href = '/admin/logs'}
          >
            <svg className="mb-2 h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <h3 className="text-lg font-medium text-red-700">บันทึกระบบ</h3>
            <p className="text-center text-sm text-gray-600">ดูประวัติการทำงาน</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-4">
        <h2 className="mb-2 text-xl font-bold">ข้อมูลสรุป (Summary)</h2>
        <p className="mb-4 text-sm text-gray-600">สถิติโดยรวมของแอปพลิเคชัน</p>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">หมวดหมู่</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">จำนวน</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">เปอร์เซ็นต์ของทั้งหมด</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">การเปลี่ยนแปลง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">ผู้ใช้ทั้งหมด</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{stats.totalUsers}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">100%</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-green-500">+{stats.recentRegistrations} (7 วัน)</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">ผู้ใช้ที่ยังใช้งานอยู่</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{stats.activeUsers}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : '0'}%
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">-</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">จำนวนหนี้ทั้งหมด</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{stats.totalDebts}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">-</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">-</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">ยอดหนี้รวมทั้งหมด</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{stats.totalDebtAmount.toLocaleString()} บาท</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">-</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
