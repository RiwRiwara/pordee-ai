import React, { useEffect } from "react";

import { formatNumber } from "../utils/debtPlanUtils";

interface AdjustPlanScrollRangeProps {
  sliderValue: number;
  setSliderValue: (value: number) => void;
  goalSliderValue: number;
  setGoalSliderValue: (value: number) => void;
  originalMonthlyPayment: number;
  onValueChange?: (paymentValue: number, goalValue: number) => void;
  onResetPlan?: () => void;
}

export default function AdjustPlanScrollRange({
  sliderValue,
  setSliderValue,
  goalSliderValue,
  setGoalSliderValue,
  originalMonthlyPayment,
  onValueChange,
  onResetPlan,
}: AdjustPlanScrollRangeProps) {
  // Calculate slider ranges
  const minPayment = Math.max(1000, originalMonthlyPayment * 0.5);
  const maxPayment = originalMonthlyPayment * 3;
  const step = Math.max(100, Math.floor(originalMonthlyPayment * 0.05)); // 5% increments

  // Handle payment slider change
  const handlePaymentSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = Number(e.target.value);

    setSliderValue(newValue);
  };

  // Handle goal slider change
  const handleGoalSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);

    setGoalSliderValue(newValue);
  };

  // Notify parent component when values change
  useEffect(() => {
    if (onValueChange) {
      onValueChange(sliderValue, goalSliderValue);
    }
  }, [sliderValue, goalSliderValue, onValueChange]);

  // Get goal label based on slider value
  const getGoalLabel = () => {
    if (goalSliderValue < 33) return "เห็นผลเร็ว";
    if (goalSliderValue < 66) return "สมดุล";

    return "ประหยัดดอกเบี้ย";
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">ปรับแต่งแผนด้วยตัวคุณเอง</h3>
      </div>

      {/* Payment Amount Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="payment-slider"
          >
            จำนวนเงินโปะ / เดือน
          </label>
          <span className="text-sm font-medium text-[#3C7DD1]">
            {formatNumber(sliderValue)} บาท
          </span>
        </div>
        <div className="relative">
          <input
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:bg-gray-300"
            id="payment-slider"
            max={maxPayment}
            min={minPayment}
            step={step}
            style={{
              // Custom styling for better appearance
              background: `linear-gradient(to right, #3C7DD1 0%, #3C7DD1 ${((sliderValue - minPayment) / (maxPayment - minPayment)) * 100}%, #e5e7eb ${((sliderValue - minPayment) / (maxPayment - minPayment)) * 100}%, #e5e7eb 100%)`,
            }}
            type="range"
            value={sliderValue}
            onChange={handlePaymentSliderChange}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatNumber(minPayment)}</span>
            <span>{formatNumber(maxPayment)}</span>
          </div>
        </div>
      </div>

      {/* Goal Balance Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="goal-slider"
          >
            น้ำหนักเป้าหมาย
          </label>
          <span className="text-xs font-medium px-2 py-1 bg-gray-200 rounded-full">
            {getGoalLabel()}
          </span>
        </div>
        <div className="relative">
          <input
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:bg-gray-300"
            id="goal-slider"
            max={100}
            min={0}
            step={5}
            style={{
              // Custom styling for better appearance
              background: `linear-gradient(to right, #3C7DD1 0%, #3C7DD1 ${goalSliderValue}%, #e5e7eb ${goalSliderValue}%, #e5e7eb 100%)`,
            }}
            type="range"
            value={goalSliderValue}
            onChange={handleGoalSliderChange}
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>เห็นผลเร็ว</span>
            <span>ประหยัดดอกเบี้ย</span>
          </div>
        </div>
      </div>
    </div>
  );
}
