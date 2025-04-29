"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { IoWalletOutline, IoPersonCircle } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";

import { useGuest } from "@/context/GuestContext";
import { useAuth } from "@/context/AuthContext";
import { useCustomToast } from "@/components/ui/ToastNotification";

const BottomNavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isGuestMode } = useGuest();
  const { isAuthenticated } = useAuth();
  const { showNotification } = useCustomToast();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 z-50 h-20 w-full border-t border-gray-200 bg-yellow-400 rounded-t-3xl">
      {/* Top border indicator - darker line */}

      <div className="mx-auto grid h-full max-w-lg grid-cols-3">
        {/* Dashboard / Wallet */}
        <Link
          className="group flex flex-col items-center justify-center"
          href="/dashboard"
        >
          <div
            className={`w-12 h-12 rounded-full  flex items-center justify-center ${isActive("/dashboard") ? " bg-white" : ""}`}
          >
            <IoWalletOutline
              className={`w-7 h-7 ${isActive("/dashboard") ? "text-black" : "text-gray-700"}`}
            />
          </div>
        </Link>

        {/* Calendar */}
        <Link
          className="group flex flex-col items-center justify-center"
          href="/planning"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive("/planning") ? " bg-white" : ""}`}
          >
            <SlCalender
              className={`w-7 h-7 ${isActive("/planning") ? "text-black" : "text-gray-700"}`}
            />
          </div>
        </Link>

        {/* Profile */}
        <div
          className="group flex flex-col items-center justify-center cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => {
            if (isAuthenticated) {
              router.push("/profile");
            } else if (isGuestMode) {
              router.push("/auth/login");
            } else {
              showNotification(
                "กรุณาเข้าสู่ระบบ",
                "คุณจำเป็นต้องเข้าสู่ระบบเพื่อดูโปรไฟล์",
                "flat",
                "warning",
              );
              router.push("/auth/login");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (isAuthenticated) {
                router.push("/profile");
              } else if (isGuestMode) {
                router.push("/auth/login");
              } else {
                showNotification(
                  "กรุณาเข้าสู่ระบบ",
                  "คุณจำเป็นต้องเข้าสู่ระบบเพื่อดูโปรไฟล์",
                  "flat",
                  "warning",
                );
                router.push("/auth/login");
              }
            }
          }}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive("/profile") ? " bg-white" : ""}`}
          >
            <IoPersonCircle
              className={`w-7 h-7 ${isActive("/profile") ? "text-black" : "text-gray-700"}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;
