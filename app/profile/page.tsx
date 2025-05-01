"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { useSession } from "next-auth/react";

import { useAuth } from "@/context/AuthContext";
import { useCustomToast } from "@/components/ui/ToastNotification";
import ProfileSetting from "@/components/ui/profile/ProfileSetting";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    languagePreference: "th",
    profileImage: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useCustomToast();
  const { data: session, update: updateSession } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }

    if (user) {
      console.log("User data from session:", user);
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.name || "",
        languagePreference: user.languagePreference || "th",
        profileImage: user.image || "", // Use the image field from the session object
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Create an immediate preview of the image
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!validTypes.includes(file.type)) {
      showNotification(
        "ไฟล์ไม่ถูกต้อง",
        "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (.jpg, .jpeg, .png)",
        "solid",
        "warning",
      );

      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      showNotification(
        "ไฟล์ขนาดใหญ่เกินไป",
        "กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 5MB",
        "solid",
        "warning",
      );

      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Store old image URL to delete later if upload succeeds
      const oldImageUrl = profileData.profileImage;

      // Step 1: Upload new image to blob storage
      const formData = new FormData();

      formData.append("files", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(40);

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.files || uploadData.files.length === 0) {
        throw new Error("No file data returned from upload");
      }

      const newImageUrl = uploadData.files[0].url;

      setUploadProgress(60);

      // Step 2: Update user profile with new image URL
      const updateResponse = await fetch("/api/profile/image", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileImageUrl: newImageUrl,
          oldImageUrl: oldImageUrl || null,
        }),
      });

      setUploadProgress(80);

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile image");
      }

      // Step 3: Update the profile data in the UI
      setProfileData({
        ...profileData,
        profileImage: newImageUrl,
      });

      // Step 4: Update the NextAuth session to refresh the image URL
      await updateSession({
        image: newImageUrl,
      });

      setUploadProgress(100);
      setImagePreview("");

      // Show success notification
      showNotification(
        "อัพโหลดรูปภาพสำเร็จ",
        "รูปโปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
        "solid",
        "success",
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      showNotification(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถอัปโหลดรูปภาพได้",
        "solid",
        "danger",
      );
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        if (imagePreview && !profileData.profileImage) {
          setImagePreview(null);
        }
      }, 500); // Add a small delay to ensure animations complete
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    <div className="mx-auto max-w-4xl px-4 py-8 bg-gray-50">
      <div className="mb-6 rounded-xl bg-[#3776C1] p-4 text-white">
        <h1 className="text-xl font-bold">โปรไฟล์</h1>
        <p className="text-sm text-white/80">ข้อมูลส่วนตัวและการตั้งค่า</p>
      </div>

      {message.text && (
        <div
          className={`mb-4 rounded-md p-4 ${message.type === "success" ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"}`}
        >
          {message.text}
        </div>
      )}

      {/* User Profile Card */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center sm:flex-row sm:items-start">
          <input
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/jpg"
            className="hidden"
            type="file"
            onChange={handleImageUpload}
          />
          
          <div className="mb-4 flex flex-col items-center sm:mb-0 sm:mr-6">
            <div
              className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              role="button"
              tabIndex={0}
              onClick={triggerFileUpload}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  triggerFileUpload();
                }
              }}
            >
              {/* Show different contents based on upload/image state */}
              {imagePreview ? (
                // Show preview while uploading
                <Image
                  alt="Profile Preview"
                  className="object-cover h-24 w-24 rounded-full"
                  src={imagePreview}
                />
              ) : profileData.profileImage ? (
                // Container for image + fallback
                <div className="relative h-24 w-24">
                  {/* Next.js Image for profile picture */}
                  <Image
                    alt="Profile"
                    className="object-cover rounded-full"
                    height={96}
                    src={profileData.profileImage}
                    width={96}
                    onError={(e) => {
                      // If image fails to load, hide the image
                      e.currentTarget.style.display = "none";
                      // Show the fallback div
                      const fallbackElement =
                        e.currentTarget.parentElement?.querySelector(
                          ".fallback-initials",
                        );

                      if (fallbackElement) {
                        (fallbackElement as HTMLElement).style.display = "flex";
                      }
                    }}
                  />
                  {/* Hidden fallback that will be shown if image fails to load */}
                  <div className="fallback-initials hidden absolute inset-0 h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
                    {profileData.firstName?.charAt(0) ||
                      profileData.username?.charAt(0) ||
                      "P"}
                  </div>
                </div>
              ) : (
                // Default initials avatar when no image is available
                <div className="fallback-initials flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
                  {profileData.firstName?.charAt(0) ||
                    profileData.username?.charAt(0) ||
                    "P"}
                </div>
              )}
              {/* Always show hover effect on the image since uploads are now independent of edit mode */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="h-1 w-16 bg-gray-300 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-white">
                      {uploadProgress}%
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-white">
                    เปลี่ยนรูป
                  </span>
                )}
              </div>
            </div>
            <span className="mt-2 text-xs text-gray-500">
              คลิกเพื่ออัปโหลดรูปภาพใหม่
            </span>
          </div>
          
          <div className="flex-1">
            <h2 className="mb-2 text-lg font-bold">{profileData.firstName} {profileData.lastName}</h2>
            <p className="text-sm text-gray-500">{profileData.email}</p>
            
            {!isEditing ? (
              <Button
                className="mt-3"
                color="primary"
                size="sm"
                variant="light"
                onClick={() => setIsEditing(true)}
              >
                แก้ไขโปรไฟล์
              </Button>
            ) : null}
          </div>
        </div>
        
        {isEditing && (
          <form onSubmit={handleSubmit} className="mt-6 border-t pt-6">
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="firstName"
                >
                  ชื่อจริง
                </label>
                <Input
                  className="w-full"
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
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
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
                  id="username"
                  name="username"
                  value={profileData.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="email"
                >
                  อีเมล
                </label>
                <Input
                  className="w-full"
                  disabled={true} // Email is always disabled
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                color="danger"
                type="button"
                variant="light"
                onClick={() => setIsEditing(false)}
              >
                ยกเลิก
              </Button>
              <Button
                color="primary"
                isLoading={isSaving}
                type="submit"
                variant="solid"
              >
                บันทึก
              </Button>
            </div>
          </form>
        )}
      </div>
      
      {/* Settings Section */}
      <ProfileSetting 
        languagePreference={profileData.languagePreference}
        notificationsEnabled={true}
        onLanguageToggle={handleLanguageToggle}
        onNotificationToggle={(checked) => console.log('Notification toggled:', checked)}
      />
    </div>
  );
}
