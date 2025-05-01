"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Tabs, Tab } from "@heroui/tabs";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { FiDollarSign, FiCalendar, FiTrendingDown } from "react-icons/fi";

interface DebtItem {
  _id: string;
  name: string;
  debtType: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  paymentDueDay?: number;
}

interface AdjustPlanModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentPlan?: {
    goalType: string;
    paymentStrategy: string;
    monthlyPayment: number;
    timeInMonths: number;
  };
  debts: DebtItem[];
  onSavePlan: (plan: {
    goalType: string;
    paymentStrategy: string;
    monthlyPayment: number;
    timeInMonths: number;
  }) => void;
}

export default function AdjustPlanModal({
  isOpen,
  onOpenChange,
  currentPlan,
  debts = [],
  onSavePlan,
}: AdjustPlanModalProps) {
  // Default values
  const defaultPlan = {
    goalType: "เห็นผลเร็ว",
    paymentStrategy: "Snowball",
    monthlyPayment: 0,
    timeInMonths: 30,
  };

  // State for plan settings
  const [goalType, setGoalType] = useState<string>(
    currentPlan?.goalType || defaultPlan.goalType,
  );
  const [paymentStrategy, setPaymentStrategy] = useState<string>(
    currentPlan?.paymentStrategy || defaultPlan.paymentStrategy,
  );
  const [monthlyPayment, setMonthlyPayment] = useState<number>(
    currentPlan?.monthlyPayment || calculateMinimumPayment(),
  );
  const [timeInMonths, setTimeInMonths] = useState<number>(
    currentPlan?.timeInMonths || defaultPlan.timeInMonths,
  );
  const [activeTab, setActiveTab] = useState<string>("strategy");

  // Calculate total minimum payment from all debts
  function calculateMinimumPayment(): number {
    return debts.reduce((sum, debt) => sum + (debt.minimumPayment || 0), 0);
  }

  // Calculate estimated completion date
  function calculateCompletionDate(months: number): string {
    const date = new Date();

    date.setMonth(date.getMonth() + months);

    const month = date.toLocaleString("th-TH", { month: "short" });
    const year = date.getFullYear() + 543; // Convert to Buddhist Era

    return `${month} ${year}`;
  }

  // Format numbers with commas
  function formatNumber(num: number): string {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  // Calculate total interest paid based on strategy and monthly payment
  function calculateTotalInterest(): number {
    // This is a simplified calculation - in a real app, this would be more complex
    // based on the actual payment strategy and debt details
    const totalDebt = debts.reduce(
      (sum, debt) => sum + debt.remainingAmount,
      0,
    );
    const avgInterestRate =
      debts.length > 0
        ? debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length
        : 0;

    // Simple interest calculation (this is just an estimation)
    const estimatedMonths = Math.ceil(totalDebt / (monthlyPayment || 1));
    const interest =
      totalDebt * (avgInterestRate / 100) * (estimatedMonths / 12);

    return Math.round(interest);
  }

  // Handle saving the plan
  function handleSavePlan() {
    onSavePlan({
      goalType,
      paymentStrategy,
      monthlyPayment,
      timeInMonths,
    });
    onOpenChange(false);
  }

  // Update time in months when monthly payment changes
  useEffect(() => {
    if (monthlyPayment > 0) {
      const totalDebt = debts.reduce(
        (sum, debt) => sum + debt.remainingAmount,
        0,
      );
      const estimatedMonths = Math.ceil(totalDebt / monthlyPayment);

      setTimeInMonths(estimatedMonths);
    }
  }, [monthlyPayment, debts]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg font-semibold">ปรับแผนการชำระหนี้</h2>
        </ModalHeader>

        <ModalBody>
          <Tabs
            className="w-full"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tab key="strategy" title="กลยุทธ์การชำระหนี้">
              <div className="space-y-4 py-2">
                <div>
                  <label
                    aria-label="เป้าหมายการชำระหนี้"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="goalType"
                  >
                    เป้าหมายการชำระหนี้
                  </label>
                  <Select
                    className="w-full"
                    id="goalType"
                    label="เป้าหมายการชำระหนี้"
                    selectedKeys={[goalType]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      setGoalType(selectedKey);
                    }}
                  >
                    <SelectItem key="เห็นผลเร็ว">
                      เห็นผลเร็ว (ปลดหนี้ก้อนเล็กก่อน)
                    </SelectItem>
                    <SelectItem key="ประหยัดดอกเบี้ย">
                      ประหยัดดอกเบี้ย (จัดการหนี้ดอกเบี้ยสูงก่อน)
                    </SelectItem>
                    <SelectItem key="สมดุล">
                      สมดุล (กระจายการชำระตามสัดส่วน)
                    </SelectItem>
                  </Select>
                </div>

                <div>
                  <label
                    aria-label="รูปแบบการชำระหนี้"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="paymentStrategy"
                  >
                    รูปแบบการชำระหนี้
                  </label>
                  <Select
                    className="w-full"
                    id="paymentStrategy"
                    label="รูปแบบการชำระหนี้"
                    selectedKeys={[paymentStrategy]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      setPaymentStrategy(selectedKey);
                    }}
                  >
                    <SelectItem key="Snowball">
                      Snowball (ชำระหนี้ก้อนเล็กให้หมดก่อน)
                    </SelectItem>
                    <SelectItem key="Avalanche">
                      Avalanche (ชำระหนี้ที่มีดอกเบี้ยสูงก่อน)
                    </SelectItem>
                    <SelectItem key="Proportional">
                      Proportional (กระจายชำระตามสัดส่วน)
                    </SelectItem>
                  </Select>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">คำแนะนำ</h3>
                  <p className="text-sm text-blue-700">
                    {paymentStrategy === "Snowball" &&
                      "วิธี Snowball ช่วยให้คุณเห็นความสำเร็จเร็วขึ้นโดยการปลดหนี้ก้อนเล็กก่อน ช่วยสร้างแรงจูงใจในการชำระหนี้ต่อไป"}
                    {paymentStrategy === "Avalanche" &&
                      "วิธี Avalanche ช่วยประหยัดดอกเบี้ยในระยะยาวโดยการจัดการหนี้ที่มีอัตราดอกเบี้ยสูงก่อน เหมาะสำหรับผู้ที่ต้องการลดค่าใช้จ่ายโดยรวม"}
                    {paymentStrategy === "Proportional" &&
                      "วิธี Proportional กระจายการชำระไปยังหนี้ทุกก้อนตามสัดส่วน เหมาะสำหรับผู้ที่ต้องการรักษาความสัมพันธ์กับเจ้าหนี้หลายราย"}
                  </p>
                </div>
              </div>
            </Tab>

            <Tab key="payment" title="จำนวนเงินและระยะเวลา">
              <div className="space-y-4 py-2">
                <div>
                  <label
                    aria-label="จำนวนเงินที่สามารถชำระได้ต่อเดือน"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="monthlyPayment"
                    id="monthlyPayment"
                  >
                    จำนวนเงินที่สามารถชำระได้ต่อเดือน
                  </label>
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="text-gray-500" />
                      </div>
                      <Input
                        className="pl-10"
                        min={calculateMinimumPayment()}
                        placeholder="จำนวนเงิน"
                        type="number"
                        value={monthlyPayment.toString()}
                        onChange={(e) =>
                          setMonthlyPayment(Number(e.target.value))
                        }
                      />
                    </div>
                    <span className="ml-2">บาท</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ขั้นต่ำ: {formatNumber(calculateMinimumPayment())} บาท
                    (รวมขั้นต่ำทุกหนี้)
                  </p>
                </div>

                <div>
                  <div
                    aria-label="ระยะเวลาในการชำระหนี้"
                    className="flex justify-between items-center mb-1"
                  >
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="timeInMonths"
                    >
                      ระยะเวลาในการชำระหนี้
                    </label>
                    <span className="text-sm font-medium">
                      {timeInMonths} เดือน
                    </span>
                  </div>
                  <div className="w-full">
                    <input
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      max={120}
                      min={6}
                      step={1}
                      type="range"
                      value={timeInMonths}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = Number(e.target.value);

                        setTimeInMonths(value);
                        // Adjust monthly payment based on time
                        const totalDebt = debts.reduce(
                          (sum, debt) => sum + debt.remainingAmount,
                          0,
                        );
                        const newMonthlyPayment = Math.ceil(totalDebt / value);

                        setMonthlyPayment(newMonthlyPayment);
                      }}
                    />
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                  <div className="flex items-center">
                    <FiCalendar className="text-blue-600 mr-2" />
                    <span className="text-sm">
                      คาดว่าจะปลดหนี้ได้ภายใน:{" "}
                      <strong>{calculateCompletionDate(timeInMonths)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiTrendingDown className="text-blue-600 mr-2" />
                    <span className="text-sm">
                      ดอกเบี้ยที่ต้องจ่ายประมาณ:{" "}
                      <strong>
                        {formatNumber(calculateTotalInterest())} บาท
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button color="primary" onPress={handleSavePlan}>
            บันทึกแผนการชำระหนี้
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
