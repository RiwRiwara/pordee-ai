"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";

import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    languagePreference: "th",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }

    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.name || "",
        languagePreference: user.languagePreference || "th",
      });
    }
  }, [user, isAuthenticated, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageToggle = (checked: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      languagePreference: checked ? "en" : "th",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setMessage({ text: "บันทึกข้อมูลสำเร็จ", type: "success" });
        setIsEditing(false);
        // Force a refresh to update the session with new data
        window.location.reload();
      } else {
        const error = await response.json();

        setMessage({ text: error.message || "เกิดข้อผิดพลาด", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">โปรไฟล์ของฉัน</h1>
        {!isEditing ? (
          <Button
            color="primary"
            variant="light"
            onClick={() => setIsEditing(true)}
          >
            แก้ไขโปรไฟล์
          </Button>
        ) : (
          <Button
            color="danger"
            variant="light"
            onClick={() => setIsEditing(false)}
          >
            ยกเลิก
          </Button>
        )}
      </div>

      {message.text && (
        <div
          className={`mb-4 rounded-md p-4 ${message.type === "success" ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"}`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-xl bg-content1 p-6 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
              {profileData.firstName?.charAt(0) ||
                profileData.username?.charAt(0) ||
                "P"}
            </div>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                htmlFor="firstName"
              >
                ชื่อจริง
              </label>
              <Input
                className="w-full"
                disabled={!isEditing}
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                htmlFor="lastName"
              >
                นามสกุล
              </label>
              <Input
                className="w-full"
                disabled={!isEditing}
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="email">
                อีเมล
              </label>
              <Input
                className="w-full"
                disabled={true} // Email cannot be changed
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                htmlFor="username"
              >
                ชื่อผู้ใช้
              </label>
              <Input
                className="w-full"
                disabled={true} // Username cannot be changed
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="language">
                ภาษา:{" "}
                {profileData.languagePreference === "th" ? "ไทย" : "English"}
              </label>
              <Switch
                aria-label="Language toggle"
                disabled={!isEditing}
                id="language"
                isSelected={profileData.languagePreference === "en"}
                name="language"
                onValueChange={handleLanguageToggle}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4">
              <Button
                color="primary"
                disabled={isSaving}
                isLoading={isSaving}
                type="submit"
              >
                บันทึกข้อมูล
              </Button>
            </div>
          )}
        </form>

        <div className="mt-8 border-t border-divider pt-6">
          <h2 className="mb-4 text-lg font-semibold">การตั้งค่าบัญชี</h2>
          <Button
            className="w-full"
            color="danger"
            variant="flat"
            onClick={logout}
          >
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </div>
  );
}
