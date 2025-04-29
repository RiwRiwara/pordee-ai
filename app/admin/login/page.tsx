"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { useCustomToast } from "@/components/ui/ToastNotification";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showNotification } = useCustomToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        showNotification(
          "เข้าสู่ระบบสำเร็จ",
          "ยินดีต้อนรับเข้าสู่ระบบผู้ดูแล",
          "solid",
          "success",
        );
        router.push("/admin");
      } else {
        showNotification(
          "เข้าสู่ระบบไม่สำเร็จ",
          "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
          "solid",
          "danger",
        );
      }
    } catch (error) {
      showNotification(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        "solid",
        "danger",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-50 flex h-screen w-screen overflow-hidden">
      <div className="hidden md:flex md:w-1/2 bg-blue-800 text-white justify-center items-center">
        <div className="max-w-lg p-8">
          <h1 className="text-4xl font-bold mb-4">Pordee Admin</h1>
          <p className="text-lg text-blue-100">
            ระบบจัดการหนี้ส่วนกลางสำหรับผู้ดูแลระบบโปรดี้
          </p>
          <div className="mt-8">
            <Link
              className="inline-flex items-center text-sm text-blue-100 hover:text-white"
              href="/"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  fillRule="evenodd"
                />
              </svg>
              กลับไปยังหน้าหลัก
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-4 md:px-8 lg:px-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              เข้าสู่ระบบผู้ดูแล
            </h2>
            <p className="text-sm text-gray-600">
              กรุณาลงชื่อเข้าใช้เพื่อเข้าถึงระบบจัดการ Pordee
            </p>
          </div>

          {/* Mobile - Show only on small screens */}
          <div className="mb-8 md:hidden text-center">
            <Link
              className="text-sm text-blue-600 hover:text-blue-800"
              href="/"
            >
              กลับไปยังหน้าหลัก
            </Link>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="username"
                >
                  ชื่อผู้ใช้
                </label>
                <Input
                  required
                  className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  id="username"
                  name="username"
                  placeholder="ชื่อผู้ใช้"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="password"
                >
                  รหัสผ่าน
                </label>
                <Input
                  required
                  className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  id="password"
                  name="password"
                  placeholder="รหัสผ่าน"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                className="w-full rounded-md bg-blue-800 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                isLoading={loading}
                type="submit"
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
