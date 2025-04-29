'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { useAuth } from '@/context/AuthContext';
import { RegisterData } from '@/context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    languagePreference: 'th',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(formData);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('การลงทะเบียนล้มเหลว กรุณาลองอีกครั้ง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-content1 p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Pordee</h1>
          <h2 className="mt-2 text-lg font-semibold">สมัครบัญชีใหม่</h2>
        </div>

        {error && (
          <div className="rounded-md bg-danger-50 p-4">
            <div className="text-sm text-danger-700">{error}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                ชื่อผู้ใช้
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="ชื่อผู้ใช้ของคุณ"
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                อีเมล
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="อีเมลของคุณ"
                className="mt-1 block w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium">
                  ชื่อจริง
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="ชื่อจริง"
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium">
                  นามสกุล
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="นามสกุล"
                  className="mt-1 block w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                รหัสผ่าน
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="รหัสผ่านของคุณ"
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                ยืนยันรหัสผ่าน
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="ยืนยันรหัสผ่านของคุณ"
                className="mt-1 block w-full"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              สมัครสมาชิก
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-foreground-500">มีบัญชีอยู่แล้ว? </span>
            <Link href="/auth/login" className="font-medium text-primary">
              เข้าสู่ระบบ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
