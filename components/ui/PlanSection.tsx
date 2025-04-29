'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/button';
import { Radio, RadioGroup } from '@heroui/radio';
import { Drawer, DrawerContent, DrawerBody, DrawerFooter, DrawerHeader } from '@heroui/drawer';
import { useCustomToast } from './ToastNotification';

// Plan types
type PlanType = 'quick' | 'save' | 'balanced' | null;

interface Plan {
    id: PlanType;
    title: string;
    description: string;
}

const plans: Plan[] = [
    {
        id: 'quick',
        title: 'หมดหนี้เร็ว',
        description: 'เน้นชำระหนี้ที่มีดอกเบี้ยสูงสุดก่อน สร้างแรงจูงใจและโมเมนตัมในการชำระหนี้',
    },
    {
        id: 'save',
        title: 'ประหยัดดอกเบี้ย',
        description: 'เน้นชำระหนี้ที่มีดอกเบี้ยสูงสุด ประหยัดจำนวนเงินที่ต้องจ่ายโดยรวม',
    },
    {
        id: 'balanced',
        title: 'แผนสมดุล',
        description: 'ผสมผสานวิธีการชำระหนี้ เพื่อสมดุลระหว่างความเร็วและความคุ้มค่า',
    },
];

interface PlanSectionProps {
    selectedPlan?: PlanType;
    onPlanChange?: (plan: PlanType) => void;
}

export default function PlanSection({
    selectedPlan = null,
    onPlanChange
}: PlanSectionProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [localSelectedPlan, setLocalSelectedPlan] = useState<PlanType>(selectedPlan);
    const { showNotification } = useCustomToast();

    const handlePlanChange = (planId: PlanType) => {
        setLocalSelectedPlan(planId);
    };

    const handleSave = () => {
        if (onPlanChange) {
            onPlanChange(localSelectedPlan);
        }

        showNotification(
            'เลือกแผนสำเร็จ',
            'แผนการชำระหนี้ของคุณถูกบันทึกแล้ว',
            'solid',
            'success'
        );

        setIsDrawerOpen(false);
    };

    const handleCancel = () => {
        // Reset to the previous selection
        setLocalSelectedPlan(selectedPlan);
        setIsDrawerOpen(false);
    };

    const getSelectedPlanDetails = () => {
        if (!localSelectedPlan) return null;
        return plans.find(plan => plan.id === localSelectedPlan);
    };

    const selectedPlanDetails = getSelectedPlanDetails();

    return (
        <>
            <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-md font-semibold">แผนที่คุณเลือก</h2>
                    <Button
                        variant="light"
                        color="primary"
                        size="sm"
                        className="text-primary"
                        onPress={() => setIsDrawerOpen(true)}
                    >
                        เปลี่ยน
                    </Button>
                </div>

                {selectedPlanDetails ? (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-blue-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium">{selectedPlanDetails.title}</h3>
                            <p className="text-sm text-gray-500">{selectedPlanDetails.description}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-gray-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
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
                isOpen={isDrawerOpen}
                onClose={handleCancel}
                placement="bottom"
                className="rounded-t-xl"
                aria-label="เลือกเป้าหมายของคุณ"
            >
                <DrawerContent className="rounded-t-xl max-h-[90vh]">
                    <DrawerHeader className="border-b border-gray-200 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">เลือกเป้าหมายของคุณ</h2>
                            <Button
                                isIconOnly
                                variant="light"
                                aria-label="ปิด"
                                onPress={handleCancel}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </Button>
                        </div>
                    </DrawerHeader>

                    <DrawerBody className="px-4 py-4">
                        <RadioGroup
                            value={localSelectedPlan ? localSelectedPlan : ""}
                            onValueChange={(value) => handlePlanChange(value as PlanType)}
                        >
                            {plans.map((plan) => (
                                <Radio
                                    key={plan.id}
                                    value={plan.id}
                                    className="mb-4 p-4 border rounded-xl"
                                    description={plan.description}
                                >
                                    {plan.title}
                                </Radio>
                            ))}
                        </RadioGroup>
                    </DrawerBody>

                    <DrawerFooter className="px-4 py-3 flex gap-2">
                        <Button
                            variant="flat"
                            color="default"
                            className="w-full py-3"
                            onPress={handleCancel}
                        >
                            ไม่ใช่
                        </Button>
                        <Button
                            color="primary"
                            className="w-full py-3"
                            onPress={handleSave}
                            isDisabled={!localSelectedPlan}
                        >
                            แนะนำ
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
