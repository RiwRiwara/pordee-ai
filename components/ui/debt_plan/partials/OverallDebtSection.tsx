import React from 'react';
import { formatNumber } from '../utils/debtPlanUtils';

interface OverallDebtSectionProps {
  monthlyPayment: number;
  totalRepaymentAmount: number;
  totalInterestSaved: number;
}

export default function OverallDebtSection({
  monthlyPayment = 15000,
  totalRepaymentAmount = 360000, // Total across all 6 debt types
  totalInterestSaved = 6000, // Total interest saved across all debt types
}: OverallDebtSectionProps) {
  return (
    <div className="bg-[#3C7DD1] text-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 pb-2 border-b border-blue-400">
        <h3 className="text-center font-medium">
          ภาพรวมทั้งหมด
        </h3>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Monthly Payment */}
        <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
          <p className="text-[#3C7DD1] font-medium">ยอดเงินที่ใช้ทั้งหมด/เดือน</p>
          <p className="text-[#3C7DD1] font-semibold text-xl">
            {formatNumber(monthlyPayment)} บาท
          </p>
        </div>
        
        {/* Total Interest Saved */}
        <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
          <p className="text-[#3C7DD1] font-medium">ดอกเบี้ยรวมที่ลดได้</p>
          <p className="text-[#3C7DD1] font-semibold text-xl">
            {formatNumber(totalInterestSaved)} บาท
          </p>
        </div>
      </div>
    </div>
  );
}

