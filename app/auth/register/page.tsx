"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { useAuth } from "@/context/AuthContext";
import { RegisterData } from "@/context/AuthContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    languagePreference: "th",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");

      return;
    }

    setIsLoading(true);

    try {
      const success = await register(formData);

      if (success) {
        router.push("/dashboard");
      } else {
        setError("การลงทะเบียนล้มเหลว กรุณาลองอีกครั้ง");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-content1 p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Pordee
          </h1>
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
              <label className="block text-sm font-medium" htmlFor="username">
                ชื่อผู้ใช้
              </label>
              <Input
                required
                className="mt-1 block w-full"
                id="username"
                name="username"
                placeholder="ชื่อผู้ใช้ของคุณ"
                type="text"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="email">
                อีเมล
              </label>
              <Input
                required
                autoComplete="email"
                className="mt-1 block w-full"
                id="email"
                name="email"
                placeholder="อีเมลของคุณ"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium"
                  htmlFor="firstName"
                >
                  ชื่อจริง
                </label>
                <Input
                  className="mt-1 block w-full"
                  id="firstName"
                  name="firstName"
                  placeholder="ชื่อจริง"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor="lastName">
                  นามสกุล
                </label>
                <Input
                  className="mt-1 block w-full"
                  id="lastName"
                  name="lastName"
                  placeholder="นามสกุล"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="password">
                รหัสผ่าน
              </label>
              <Input
                required
                autoComplete="new-password"
                className="mt-1 block w-full"
                id="password"
                name="password"
                placeholder="รหัสผ่านของคุณ"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium"
                htmlFor="confirmPassword"
              >
                ยืนยันรหัสผ่าน
              </label>
              <Input
                required
                autoComplete="new-password"
                className="mt-1 block w-full"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="ยืนยันรหัสผ่านของคุณ"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              className="w-full"
              color="primary"
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
            >
              สมัครสมาชิก
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-foreground-500">มีบัญชีอยู่แล้ว? </span>
            <Link className="font-medium text-primary" href="/auth/login">
              เข้าสู่ระบบ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
