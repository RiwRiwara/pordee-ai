import React from "react";
import { Button } from "@heroui/button";

interface SummarySectionProps {
  totalDebts: number;
  totalAmount: string;
  monthlyPayment: string;
  interestRate: string;
}

export default function SummarySection({
  totalDebts,
  totalAmount,
  monthlyPayment,
  interestRate,
}: SummarySectionProps) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
      {/* Planning Button */}
      <Button
        className="w-full mb-4 py-3 text-white flex items-center justify-center"
        color="primary"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 17L17 7M17 7H7M17 7V17"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
        สรุปภาพรวมหนี้ของฉัน
      </Button>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Number of Debts */}
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-500">รายการทั้งหมด</div>
          <div className="text-lg font-bold">{totalDebts} ก้อน</div>
        </div>

        {/* Total Debt Amount */}
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-500">ยอดรวม</div>
          <div className="text-lg font-bold">{totalAmount} บาท</div>
        </div>

        {/* Monthly Payment */}
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-500">จ่ายต่อเดือน</div>
          <div className="text-lg font-bold text-yellow-500">
            {monthlyPayment} บาท
          </div>
        </div>

        {/* Average Interest Rate */}
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-500">ดอกเบี้ยเฉลี่ย</div>
          <div className="text-lg font-bold">{interestRate}</div>
        </div>
      </div>
    </div>
  );
}
