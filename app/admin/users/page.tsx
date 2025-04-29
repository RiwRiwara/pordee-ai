'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Drawer } from '@heroui/drawer';
import { useCustomToast } from '@/components/ui/ToastNotification';
import Link from 'next/link';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  languagePreference: 'th' | 'en';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserFormData {
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  languagePreference: 'th' | 'en';
  isActive: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    languagePreference: 'th',
    isActive: true
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { showNotification } = useCustomToast();

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      
      let url = `/api/admin/users?page=${page}&limit=${pagination.limit}`;
      
      // Add filters if present
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          // Include admin key from env if available
          ...(process.env.NEXT_PUBLIC_ADMIN_API_KEY && {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
          })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      
      // Use sample data for demo
      setUsers([
        {
          _id: '1',
          username: 'admin',
          email: 'admin@pordee.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          languagePreference: 'th',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          username: 'user1',
          email: 'user1@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
          languagePreference: 'th',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]);
      
      setPagination({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const isEditing = !!currentUser;
      const url = isEditing 
        ? `/api/admin/users/${currentUser._id}` 
        : '/api/admin/users';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // Don't send empty password when editing
      const dataToSend = { ...formData };
      if (isEditing && !dataToSend.password) {
        delete dataToSend.password;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.NEXT_PUBLIC_ADMIN_API_KEY && {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
          })
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }

      const result = await response.json();
      
      showNotification(
        isEditing ? 'ผู้ใช้อัปเดตเรียบร้อยแล้ว' : 'สร้างผู้ใช้ใหม่เรียบร้อยแล้ว',
        isEditing ? 'ข้อมูลผู้ใช้ได้รับการอัปเดตเรียบร้อยแล้ว' : 'ผู้ใช้ใหม่ถูกสร้างเรียบร้อยแล้ว',
        'solid',
        'success'
      );
      
      setIsFormOpen(false);
      fetchUsers(pagination.page);
    } catch (err: any) {
      console.error('Error saving user:', err);
      showNotification(
        'เกิดข้อผิดพลาด',
        err.message || 'มีบางอย่างผิดพลาด กรุณาลองอีกครั้ง',
        'solid',
        'danger'
      );
    }
  };

  // Delete user
  const handleDelete = async (userId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? การกระทำนี้ไม่สามารถยกเลิกได้')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.NEXT_PUBLIC_ADMIN_API_KEY && {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
          })
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      showNotification(
        'ลบผู้ใช้เรียบร้อยแล้ว',
        'ผู้ใช้ถูกลบออกจากระบบเรียบร้อยแล้ว',
        'solid',
        'success'
      );
      
      fetchUsers(pagination.page);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showNotification(
        'เกิดข้อผิดพลาด',
        err.message || 'ไม่สามารถลบผู้ใช้ได้',
        'solid',
        'danger'
      );
    }
  };

  // Open form for creating new user
  const openCreateForm = () => {
    setCurrentUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'user',
      languagePreference: 'th',
      isActive: true
    });
    setIsCreating(true);
    setIsFormOpen(true);
  };

  // Open form for editing user
  const openEditForm = (user: User) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      languagePreference: user.languagePreference,
      isActive: user.isActive
    });
    setIsCreating(false);
    setIsFormOpen(true);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการผู้ใช้ (User Management)</h1>
          <p className="text-gray-600">จัดการบัญชีผู้ใช้ในระบบ Pordee</p>
        </div>
        <Button 
          color="primary"
          onPress={openCreateForm}
          className="mt-2 md:mt-0"
        >
          + เพิ่มผู้ใช้ใหม่
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">ค้นหา</label>
            <Input
              placeholder="ค้นหาโดยชื่อ อีเมล หรือชื่อผู้ใช้"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
              endContent={
                <button
                  onClick={() => fetchUsers()}
                  className="text-gray-400 hover:text-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">สถานะ</label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="ทั้งหมด"
              className="w-full"
            >
              <SelectItem value="">ทั้งหมด</SelectItem>
              <SelectItem value="active">เปิดใช้งาน</SelectItem>
              <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">บทบาท</label>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder="ทั้งหมด"
              className="w-full"
            >
              <SelectItem value="">ทั้งหมด</SelectItem>
              <SelectItem value="user">ผู้ใช้</SelectItem>
              <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
            </Select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ผู้ใช้</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">อีเมล</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">บทบาท</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ภาษา</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">วันที่สร้าง</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    ไม่พบข้อมูลผู้ใช้
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 text-center">
                          <span className="inline-block pt-2 text-lg font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">
                            {user.firstName || ''} {user.lastName || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.languagePreference === 'th' ? 'ไทย' : 'อังกฤษ'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Button
                        color="primary"
                        variant="flat"
                        size="sm"
                        className="mr-2"
                        onPress={() => openEditForm(user)}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        color="danger"
                        variant="flat"
                        size="sm"
                        onPress={() => handleDelete(user._id)}
                      >
                        ลบ
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                size="sm"
                variant="flat"
                isDisabled={pagination.page === 1}
                onPress={() => fetchUsers(pagination.page - 1)}
              >
                ก่อนหน้า
              </Button>
              <Button
                size="sm"
                variant="flat"
                isDisabled={pagination.page === pagination.totalPages}
                onPress={() => fetchUsers(pagination.page + 1)}
              >
                ถัดไป
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  แสดง <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> ถึง <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> จากทั้งหมด <span className="font-medium">{pagination.total}</span> รายการ
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => fetchUsers(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      pagination.page === 1 ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => fetchUsers(i + 1)}
                      className={`relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium ${
                        pagination.page === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => fetchUsers(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      pagination.page === pagination.totalPages ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Form Drawer */}
      <Drawer 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        placement="right"
        size="md"
      >
        <div className="h-full bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isCreating ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขข้อมูลผู้ใช้'}
            </h2>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้ <span className="text-red-500">*</span></label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                placeholder="ชื่อผู้ใช้"
                className="mt-1 w-full"
                disabled={!isCreating}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">อีเมล <span className="text-red-500">*</span></label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="อีเมล"
                className="mt-1 w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {isCreating ? 'รหัสผ่าน' : 'รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)'}
                {isCreating && <span className="text-red-500"> *</span>}
              </label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                placeholder="รหัสผ่าน"
                className="mt-1 w-full"
                required={isCreating}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  placeholder="ชื่อ"
                  className="mt-1 w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  placeholder="นามสกุล"
                  className="mt-1 w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">บทบาท <span className="text-red-500">*</span></label>
              <Select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                className="mt-1 w-full"
                required
              >
                <SelectItem value="user">ผู้ใช้ทั่วไป</SelectItem>
                <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">ภาษา <span className="text-red-500">*</span></label>
              <Select
                name="languagePreference"
                value={formData.languagePreference}
                onChange={handleFormChange}
                className="mt-1 w-full"
                required
              >
                <SelectItem value="th">ไทย</SelectItem>
                <SelectItem value="en">อังกฤษ</SelectItem>
              </Select>
            </div>
            
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                เปิดใช้งาน
              </label>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <Button
                color="default"
                variant="flat"
                onPress={() => setIsFormOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                color="primary"
                type="submit"
              >
                {isCreating ? 'สร้างผู้ใช้' : 'บันทึกการเปลี่ยนแปลง'}
              </Button>
            </div>
          </form>
        </div>
      </Drawer>
    </div>
  );
}
