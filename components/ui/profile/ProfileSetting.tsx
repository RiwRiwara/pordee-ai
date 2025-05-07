import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import {
  FiBell,
  FiChevronRight,
  FiRefreshCw,
  FiTrash2,
  FiX,
  FiFileText,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import SurveyModal from "../debt_plan/SurveyModal";

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
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isResetModalOpen) {
      inputRef.current?.focus(); // Focus the input when the modal opens

      // Focus trapping logic
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, input, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      modalRef.current?.addEventListener("keydown", handleTab);

      return () => modalRef.current?.removeEventListener("keydown", handleTab);
    }
  }, [isResetModalOpen]);

  const handleResetData = async () => {
    if (confirmText !== "Confirm") {
      toast.error("โปรดพิมพ์ 'Confirm' เพื่อยืนยันการรีเซ็ตข้อมูล");

      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch("/api/profile/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || "การรีเซ็ตข้อมูลล้มเหลว");
      }

      toast.success("รีเซ็ตข้อมูลสำเร็จ");
      setIsResetModalOpen(false);
      setConfirmText("");
      window.location.reload();
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "คุณแน่ใจหรือไม่ที่จะลบบัญชีนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      )
    ) {
      try {
        const response = await fetch("/api/profile/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(errorData.message || "การลบบัญชีล้มเหลว");
        }

        toast.success("ลบบัญชีสำเร็จ");
        logout();
        router.push("/login");
      } catch (error) {
        console.error("Delete account error:", error);
        toast.error("เกิดข้อผิดพลาดในการลบบัญชี");
      }
    }
  };

  const handleUpgradeClick = () => {
    toast("Premium features coming soon! 🚀", {
      icon: "✨",
    });
  };

  const handleSurveyComplete = (skipped?: boolean) => {
    if (!skipped) {
      toast.success("ขอบคุณสำหรับการตอบแบบสอบถาม");
    }
  };

  return (
    <>
      <div className="flex flex-col">
        {/* Language and Notifications Section */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-[#3776C1]">
            ตัวเลือก & ตั้งค่า
          </h2>

          <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
            {/* Language Setting */}
            {/* <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <FiGlobe className="mr-3 text-gray-500" />
                <span>ภาษา</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`cursor-pointer ${
                    languagePreference === "th" ? "text-blue-500 font-medium" : ""
                  }`}
                  onClick={() => onLanguageToggle(true)}
                >
                  TH
                </span>
                <span>/</span>
                <span
                  className={`cursor-pointer ${
                    languagePreference === "en" ? "text-blue-500 font-medium" : ""
                  }`}
                  onClick={() => onLanguageToggle(false)}
                >
                  EN
                </span>
              </div>
            </div> */}

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

            {/* Survey option */}
            <button
              className="flex w-full items-center justify-between border-t py-2 cursor-pointer"
              onClick={() => setIsSurveyModalOpen(true)}
            >
              <div className="flex items-center">
                <FiFileText className="mr-3 text-gray-500" />
                <span>แบบสอบถามความคิดเห็น</span>
              </div>
              <FiChevronRight className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Reset Data Section */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-red-500">
            ดำเนินการบัญชี
          </h2>

          <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
            {/* Reset Data Button */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <FiRefreshCw className="mr-3 text-yellow-500" />
                <div>
                  <p>รีเซ็ตข้อมูล</p>
                  <p className="text-xs text-gray-500">
                    ล้างข้อมูลหนี้ แผนการจัดการหนี้ และข้อมูลการเงินทั้งหมด
                  </p>
                </div>
              </div>
              <Button
                color="warning"
                size="sm"
                variant="flat"
                onClick={() => setIsResetModalOpen(true)}
              >
                รีเซ็ต
              </Button>
            </div>

            {/* Delete Account Button */}
            <div className="flex items-center justify-between border-t py-2">
              <div className="flex items-center">
                <FiTrash2 className="mr-3 text-red-500" />
                <div>
                  <p>ลบบัญชี</p>
                  <p className="text-xs text-gray-500">
                    ลบบัญชีและข้อมูลทั้งหมดออกจากระบบ (ไม่สามารถย้อนกลับได้)
                  </p>
                </div>
              </div>
              <Button
                color="danger"
                size="sm"
                variant="flat"
                onClick={handleDeleteAccount}
              >
                ลบ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div ref={modalRef} className="fixed inset-0 z-50">
          {/* Backdrop that can be clicked to close the modal */}
          <button
            aria-label="Close modal"
            className="absolute inset-0 w-full h-full bg-black bg-opacity-50"
            onClick={() => {
              setIsResetModalOpen(false);
              setConfirmText("");
            }}
          />
          {/* Container for the actual modal content */}
          <div
            aria-labelledby="reset-modal-title"
            aria-modal="true"
            className="fixed inset-0 flex items-center justify-center p-2 sm:p-4"
            role="dialog"
          >
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal header with title and close button */}
              <div className="flex justify-between items-center mb-4">
                <h3
                  className="text-lg font-semibold text-red-500"
                  id="reset-modal-title"
                >
                  รีเซ็ตข้อมูลทั้งหมด
                </h3>
                <button
                  aria-label="ปิดโมดัล"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setConfirmText("");
                  }}
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal body with warning and confirmation */}
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  การดำเนินการนี้จะลบข้อมูลดังต่อไปนี้:
                </p>
                <ul className="list-disc list-inside mb-4 text-gray-600">
                  <li>ข้อมูลหนี้ทั้งหมด</li>
                  <li>ประวัติการชำระหนี้</li>
                  <li>แผนการจัดการหนี้</li>
                  <li>ข้อมูลการเงิน</li>
                </ul>
                <p className="font-semibold text-red-500 mb-2">
                  การดำเนินการนี้ไม่สามารถย้อนกลับได้!
                </p>
                <p className="mb-3">
                  โปรดพิมพ์ <span className="font-bold">Confirm</span>{" "}
                  เพื่อยืนยัน
                </p>
                <input
                  ref={inputRef}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm"
                  type="text"
                  value={confirmText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmText(e.target.value)
                  }
                />
              </div>

              {/* Modal footer with action buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  ref={cancelButtonRef}
                  className="bg-gray-100"
                  variant="flat"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setConfirmText("");
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="bg-red-500 text-white hover:bg-red-600"
                  disabled={isResetting}
                  onClick={handleResetData}
                >
                  {isResetting ? "กำลังรีเซ็ต..." : "รีเซ็ตข้อมูล"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Modal */}
      <SurveyModal
        isOpen={isSurveyModalOpen}
        source="profile"
        onComplete={handleSurveyComplete}
        onOpenChange={setIsSurveyModalOpen}
      />
    </>
  );
}
