import React from "react";

interface PlanAdjustmentProps {
  sliderValue: number;
  setSliderValue: (value: number) => void;
  goalSliderValue: number;
  setGoalSliderValue: (value: number) => void;
  originalMonthlyPayment: number;
  formatNumber: (num: number) => string;
}

export default function PlanAdjustment({
  sliderValue,
  setSliderValue,
  goalSliderValue,
  setGoalSliderValue,
  originalMonthlyPayment,
  formatNumber,
}: PlanAdjustmentProps) {
  // Handle payment amount slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);

    setSliderValue(value);
  };

  // Handle goal balance slider change
  const handleGoalSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);

    setGoalSliderValue(value);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-center font-medium mb-4">ปรับแต่งแผนด้วยตัวคุณเอง</h3>

      {/* Payment Amount Slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="payment-slider"
          >
            จำนวนเงินโปะ / เดือน
          </label>
          <span className="text-sm font-medium">
            {formatNumber(sliderValue)} บาท
          </span>
        </div>
        <input
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          id="payment-slider"
          max={Math.max(originalMonthlyPayment * 3, 50000)}
          min={Math.max(originalMonthlyPayment * 0.5, 500)}
          step={100}
          type="range"
          value={sliderValue}
          onChange={handleSliderChange}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            {formatNumber(Math.max(originalMonthlyPayment * 0.5, 500))}
          </span>
          <span>
            {formatNumber(Math.max(originalMonthlyPayment * 3, 50000))}
          </span>
        </div>
      </div>

      {/* Goal Balance Slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="goal-slider"
          >
            น้ำหนักเป้าหมาย
          </label>
        </div>
        <input
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          id="goal-slider"
          max={100}
          min={0}
          step={1}
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
  );
}
