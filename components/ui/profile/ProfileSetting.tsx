import React from "react";
import { Button } from "@heroui/button";
import { FiChevronRight } from "react-icons/fi";
import { FiGlobe, FiBell, FiStar, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { Switch } from "@heroui/switch";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

interface ProfileSettingProps {
  languagePreference: string;
  notificationsEnabled?: boolean;
  onLanguageToggle: (checked: boolean) => void;
  onNotificationToggle?: (checked: boolean) => void;
}

export default function ProfileSetting({
  languagePreference,
  notificationsEnabled = true,
  onLanguageToggle,
  onNotificationToggle = () => {},
}: ProfileSettingProps) {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex flex-col">
      {/* Language and Notifications Section */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-[#3776C1]">
          ตัวเลือก & ตั้งค่า
        </h2>

        <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
          {/* Language Setting */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <FiGlobe className="mr-3 text-gray-500" />
              <span>ภาษา</span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm ${languagePreference === "th" ? "font-bold text-[#3776C1]" : "text-gray-500"}`}
              >
                TH
              </span>
              <Switch
                isSelected={languagePreference === "en"}
                size="sm"
                onValueChange={onLanguageToggle}
              />
              <span
                className={`text-sm ${languagePreference === "en" ? "font-bold text-[#3776C1]" : "text-gray-500"}`}
              >
                EN
              </span>
            </div>
          </div>

          {/* Notification Setting */}
          <div className="flex items-center justify-between border-t py-2">
            <div className="flex items-center">
              <FiBell className="mr-3 text-gray-500" />
              <span>การแจ้งเตือน</span>
            </div>
            <Switch
              isSelected={notificationsEnabled}
              size="sm"
              onValueChange={onNotificationToggle}
            />
          </div>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-[#3776C1]">
          จัดการบัญชี
        </h2>

        <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
          {/* Premium Features */}
          <button
            className="flex w-full items-center justify-between py-2"
            onClick={() => router.push("/premium")}
          >
            <div className="flex items-center">
              <FiStar className="mr-3 text-yellow-500" />
              <span>อัพเกรดบัญชี</span>
            </div>
            <FiChevronRight className="text-gray-400" />
          </button>

          {/* Reset Account */}
          <button
            className="flex w-full items-center justify-between border-t py-2"
            onClick={() =>
              window.confirm("คุณแน่ใจหรือไม่ที่จะรีเซ็ตข้อมูลบัญชี?")
            }
          >
            <div className="flex items-center">
              <FiRefreshCw className="mr-3 text-orange-500" />
              <span>รีเซ็ตข้อมูลทั้งหมด</span>
            </div>
            <FiChevronRight className="text-gray-400" />
          </button>

          {/* Delete Account */}
          <button
            className="flex w-full items-center justify-between border-t py-2 text-red-500"
            onClick={() =>
              window.confirm(
                "คุณแน่ใจหรือไม่ที่จะลบบัญชีนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
              )
            }
          >
            <div className="flex items-center">
              <FiTrash2 className="mr-3" />
              <span>ลบบัญชีถาวร</span>
            </div>
            <FiChevronRight className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-4">
        <Button
          className="w-full bg-red-50 text-red-600 hover:bg-red-100"
          variant="flat"
          onClick={logout}
        >
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}
