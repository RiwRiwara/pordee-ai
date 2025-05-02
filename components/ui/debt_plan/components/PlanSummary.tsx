import React from "react";

interface PlanSummaryProps {
  monthlyPayment: number;
  timeInMonths: number;
  formatNumber: (num: number) => string;
}

export default function PlanSummary({
  monthlyPayment,
  timeInMonths,
  formatNumber,
}: PlanSummaryProps) {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm">ยอดชำระต่อเดือน</p>
          <p className="text-xl font-bold">
            {formatNumber(monthlyPayment)} บาท
          </p>
        </div>
        <div>
          <p className="text-sm">ยอดที่ชำระทั้งหมด</p>
          <p className="text-xl font-bold">
            {formatNumber(monthlyPayment * timeInMonths)} บาท
          </p>
        </div>
      </div>
    </div>
  );
}
