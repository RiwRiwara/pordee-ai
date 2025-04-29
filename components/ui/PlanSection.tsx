"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Radio, RadioGroup } from "@heroui/radio";
import { Drawer, DrawerContent, DrawerHeader } from "@heroui/drawer";

import { useCustomToast } from "./ToastNotification";

// Plan types
type PlanType = "quick" | "save" | "balanced" | null;

interface Plan {
  id: PlanType;
  title: string;
  description: string;
}

const plans: Plan[] = [
  {
    id: "quick",
    title: "หมดหนี้เร็ว",
    description:
      "เน้นชำระหนี้ที่มีดอกเบี้ยสูงสุดก่อน สร้างแรงจูงใจและโมเมนตัมในการชำระหนี้",
  },
  {
    id: "save",
    title: "ประหยัดดอกเบี้ย",
    description:
      "เน้นชำระหนี้ที่มีดอกเบี้ยสูงสุด ประหยัดจำนวนเงินที่ต้องจ่ายโดยรวม",
  },
  {
    id: "balanced",
    title: "แผนสมดุล",
    description:
      "ผสมผสานวิธีการชำระหนี้ เพื่อสมดุลระหว่างความเร็วและความคุ้มค่า",
  },
];

interface PlanSectionProps {
  selectedPlan: "quick" | "save" | "balanced" | null;
  onPlanChange: (plan: "quick" | "save" | "balanced" | null) => void;
}

export default function PlanSection({
  selectedPlan,
  onPlanChange,
}: PlanSectionProps) {
  const [isPlanDrawerOpen, setIsPlanDrawerOpen] = useState(false);
  const { showNotification } = useCustomToast();

  const handleSelectPlan = (plan: "quick" | "save" | "balanced" | null) => {
    onPlanChange(plan);
    setIsPlanDrawerOpen(false);
  };

  const handleSave = () => {
    showNotification(
      "เลือกแผนสำเร็จ",
      "แผนการชำระหนี้ของคุณถูกบันทึกแล้ว",
      "solid",
      "success",
    );

    setIsPlanDrawerOpen(false);
  };

  const handleCancel = () => {
    setIsPlanDrawerOpen(false);
  };

  const getSelectedPlanDetails = () => {
    if (!selectedPlan) return null;

    return plans.find((plan) => plan.id === selectedPlan);
  };

  const selectedPlanDetails = getSelectedPlanDetails();

  return (
    <>
      <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-md font-semibold">แผนที่คุณเลือก</h2>
          <Button
            className="text-primary"
            color="primary"
            size="sm"
            variant="light"
            onPress={() => setIsPlanDrawerOpen(true)}
          >
            เปลี่ยน
          </Button>
        </div>

        {selectedPlanDetails ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">{selectedPlanDetails.title}</h3>
              <p className="text-sm text-gray-500">
                {selectedPlanDetails.description}
              </p>
              {selectedPlan === "balanced" && (
                <div className="text-xs text-gray-500 mt-1">
                  สมดุลระหว่างจ่ายเร็วและประหยัดดอกเบี้ย
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </div>
            <div className="text-gray-500 text-sm">
              กรุณาเพิ่มข้อมูลในส่วนอื่นให้ครบ
              <br />
              เพื่อเริ่มวางแผน
            </div>
          </div>
        )}
      </div>

      {/* Plan Selection Drawer */}
      <Drawer
        aria-label="เลือกเป้าหมายของคุณ"
        className="rounded-t-xl"
        isOpen={isPlanDrawerOpen}
        placement="bottom"
        onClose={handleCancel}
      >
        <DrawerContent className="rounded-t-xl max-h-[90vh]">
          <DrawerHeader className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">เลือกเป้าหมายของคุณ</h2>
              <Button
                isIconOnly
                aria-label="ปิด"
                variant="light"
                onPress={handleCancel}
              >
                <svg
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="18" x2="6" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </Button>
            </div>
          </DrawerHeader>

          <div className="px-4 py-3">
            <RadioGroup
              className="space-y-4"
              value={selectedPlan !== null ? selectedPlan : ""}
              onValueChange={(value) => {
                // Handle value as appropriate PlanType
                if (value === "") {
                  handleSelectPlan(null);
                } else {
                  handleSelectPlan(value as "quick" | "save" | "balanced");
                }
              }}
            >
              {plans.map((plan) => (
                <Radio
                  key={plan.id}
                  className="p-4 border rounded-xl"
                  description={plan.description}
                  value={plan.id}
                >
                  {plan.title}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button color="default" onPress={handleCancel}>
              ยกเลิก
            </Button>
            <Button color="primary" onPress={handleSave}>
              บันทึก
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
