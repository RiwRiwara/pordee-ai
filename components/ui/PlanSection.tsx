"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Radio, RadioGroup } from "@heroui/radio";
import { Modal, ModalContent, ModalHeader } from "@heroui/modal";

import { useCustomToast } from "./ToastNotification";

import { useTracking } from "@/lib/tracking";

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
    title: "เห็นผลเร็ว",
    description: "เลือกจ่ายหนี้ก้อนเล็กก่อน เพื่อปลดหนี้ก้อนแรกได้ไว",
  },
  {
    id: "save",
    title: "คุ้มที่สุด",
    description: "โฟกัสหนี้ดอกเบี้ยสูง ลดต้นทุนได้มากที่สุดเฉพาะบุคคล",
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
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const { showNotification } = useCustomToast();
  const { trackPlannerStart, trackEdit } = useTracking();

  // Track when user starts viewing/using the planner
  useEffect(() => {
    trackPlannerStart();
  }, []);

  const handleSelectPlan = (plan: "quick" | "save" | "balanced" | null) => {
    onPlanChange(plan);
    setIsPlanModalOpen(false);
  };

  const handleSave = () => {
    showNotification(
      "เลือกแผนสำเร็จ",
      "แผนการชำระหนี้ของคุณถูกบันทึกแล้ว",
      "solid",
      "success",
    );

    // Track when user saves a plan choice as an edit
    trackEdit();

    setIsPlanModalOpen(false);
  };

  const handleCancel = () => {
    setIsPlanModalOpen(false);
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
            onPress={() => setIsPlanModalOpen(true)}
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

      {/* Plan Selection Modal */}
      <Modal
        aria-label="เลือกเป้าหมายของคุณ"
        classNames={{
          backdrop: "bg-[rgba(0,0,0,0.5)]",
          base: "mx-auto",
        }}
        isOpen={isPlanModalOpen}
        placement="center"
        size="md"
        onClose={handleCancel}
      >
        <ModalContent className="max-h-[80vh] rounded-lg overflow-hidden">
          <ModalHeader className="border-b border-gray-200 px-5 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">เลือกเป้าหมายของคุณ</h2>
            </div>
          </ModalHeader>

          <div className="px-5 py-4 overflow-y-auto">
            <RadioGroup
              className="space-y-4"
              value={selectedPlan !== null ? selectedPlan : ""}
              onValueChange={(value) => {
                // Track edit when user selects a plan
                trackEdit();

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
                  className="p-4 border rounded-xl hover:border-primary-200 transition-colors"
                  classNames={{
                    base: "max-w-full",
                    label: "font-medium",
                    description: "text-gray-600 text-sm mt-1",
                  }}
                  description={plan.description}
                  value={(plan.id as PlanType) || "quick"}
                >
                  {plan.title}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <div className="px-5 py-4 border-t border-gray-200 flex justify-end space-x-3 mt-2">
            <Button
              className="px-4"
              color="default"
              variant="light"
              onPress={handleCancel}
            >
              ยกเลิก
            </Button>
            <Button
              className="px-5 font-medium shadow-sm"
              color="primary"
              onPress={handleSave}
            >
              บันทึก
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
