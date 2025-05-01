"use client";

import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useGuest } from "@/context/GuestContext";
import { useAuth } from "@/context/AuthContext";
import { useCustomToast } from "@/components/ui/ToastNotification";

export default function Home() {
    const router = useRouter();
    const { enterGuestMode } = useGuest();
    const { showNotification } = useCustomToast();
    const { isAuthenticated, isLoading } = useAuth();

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <section className="flex min-h-[85vh] flex-col items-center justify-center gap-8 py-8 md:py-10">
            <div className="flex flex-col items-center">
                <h1 className="mb-4 text-4xl font-bold tracking-tight">PORDEE</h1>

                <div className="mb-2 text-center text-xl">
                    <span className="text-blue-500">Balance</span>
                    <span className="mx-2">Your</span>
                    <span className="text-orange-500">Debt</span>
                </div>

                <div className="mb-8 text-center text-xl">
                    <span className="text-orange-500">Sustain</span>
                    <span className="mx-2">Your</span>
                    <span className="text-blue-500">Life</span>
                </div>

                <div className="mb-8 text-center text-gray-600">
                    <p>ให้เรา​ช่วยบริหาร</p>
                    <p>จัดการหนี้ของคุณนะ</p>
                </div>
            </div>

            <div className="flex w-full max-w-xs flex-col gap-4">
                <Button
                    className="w-full"
                    color="primary"
                    size="lg"
                    onPress={() => {
                        enterGuestMode();
                        showNotification(
                            "เข้าสู่โหมดผู้เยี่ยมชม",
                            "คุณสามารถใช้งานแอปได้โดยไม่ต้องลงทะเบียน",
                            "solid",
                            "success",
                        );

                        router.push("/dashboard");
                    }}
                >
                    เริ่มต้น!
                </Button>

                <div className="flex items-center justify-center gap-3">
                    <div className="h-px flex-1 bg-gray-300" />
                    <span className="text-sm text-gray-500">มีบัญชีอยู่แล้ว ?</span>
                    <div className="h-px flex-1 bg-gray-300" />
                </div>

                <Button
                    className="w-full bg-[#FFBC34] text-white"
                    color="warning"
                    size="lg"
                    variant="flat"
                    onPress={() => router.push("/auth/login")}
                >
                    เข้าสู่ระบบ
                </Button>
            </div>
        </section>
    );
}
