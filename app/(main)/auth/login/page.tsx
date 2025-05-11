"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        router.push("/dashboard");
      } else {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
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
          <h2 className="mt-2 text-lg font-semibold">เข้าสู่ระบบ</h2>
        </div>

        {error && (
          <div className="rounded-md bg-danger-50 p-4">
            <div className="text-sm text-danger-700">{error}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="password">
                รหัสผ่าน
              </label>
              <Input
                required
                autoComplete="current-password"
                className="mt-1 block w-full"
                id="password"
                name="password"
                placeholder="รหัสผ่านของคุณ"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              เข้าสู่ระบบ
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-foreground-500">ยังไม่มีบัญชี? </span>
            <Link className="font-medium text-primary" href="/auth/register">
              สมัครใช้งาน
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
