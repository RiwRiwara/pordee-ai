import React from 'react';
import { Button } from '@heroui/button';

interface SummarySectionProps {
  totalDebts?: number;
  totalAmount?: string;
  monthlyPayment?: string;
  interestRate?: string;
}

export default function SummarySection({
  totalDebts = 2,
  totalAmount = '130,001.00',
  monthlyPayment = '5,000.00',
  interestRate = '8.5%'
}: SummarySectionProps) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
      {/* Planning Button */}
      <Button
        color="primary"
        className="w-full mb-4 py-3 text-white flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        เริ่มวางแผน
      </Button>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Number of Debts */}
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">หนี้ทั้งหมด</p>
          <p className="text-xl font-bold">{totalDebts} ก้อน</p>
        </div>

        {/* Total Debt Amount */}
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">ยอดหนี้รวม</p>
          <p className="text-xl font-bold">{totalAmount} บาท</p>
        </div>

        {/* Monthly Payment */}
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">ยอดชำระต่อเดือน</p>
          <p className="text-xl font-bold text-yellow-500">{monthlyPayment} บาท</p>
        </div>

        {/* Average Interest Rate */}
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">อัตราดอกเบี้ยเฉลี่ย</p>
          <p className="text-xl font-bold">{interestRate}</p>
        </div>
      </div>
    </div>
  );
}
