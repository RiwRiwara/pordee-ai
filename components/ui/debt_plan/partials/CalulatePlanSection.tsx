import React from 'react';
import { FiClock, FiDollarSign, FiChevronDown } from 'react-icons/fi';
import { formatNumber } from '../utils/debtPlanUtils';

interface CalculatePlanSectionProps {
  originalTimeInMonths: number; // แผนเดิม เวลา
  originalMonthlyPayment: number; // แผนเดิม เงิน
  newPlanTimeInMonths: number; // แผนใหม่ เวลา
  newPlanMonthlyPayment: number; // แผนใหม่ เงิน
  savedTimeInMonths: number; // ลดลงไป เวลา
  savedAmount: number; // ประหยัดไป เงิน
  currentDebtTypeId: string;
}

export default function CalculatePlanSection({
  originalTimeInMonths = 24,
  originalMonthlyPayment = 8000,
  newPlanTimeInMonths = 20,
  newPlanMonthlyPayment = 5500,
  savedTimeInMonths = 4,
  savedAmount = 2500,
  currentDebtTypeId = 'total'
}: CalculatePlanSectionProps) {
  // Track which tab is active (เวลาที่ใช้ or เงินที่ใช้ไป)
  const [activeTab, setActiveTab] = React.useState<'time' | 'money'>('time');

  return (
    <div>
      {/* Tab Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setActiveTab('time')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg ${activeTab === 'time' ? 'bg-[#3C7DD1] text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          <FiClock size={18} />
          <span>เวลาที่ใช้</span>
        </button>
        <button
          onClick={() => setActiveTab('money')} 
          className={`flex items-center justify-center gap-2 py-2 rounded-lg ${activeTab === 'money' ? 'bg-[#3C7DD1] text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          <FiDollarSign size={18} />
          <span>ดอกเบี้ยที่ใช้</span>
        </button>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Left Column */}
        <div className="space-y-2">
          {/* แผนเดิม */}
          <div className="bg-white border border-gray-200 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">แผนเดิม</p>
            <div className="flex flex-col items-center">
              <p className="text-2xl font-semibold text-gray-900">
                {activeTab === 'time' ? `${originalTimeInMonths} เดือน` : `${formatNumber(originalMonthlyPayment)} บาท`}
              </p>
              <div className="mt-2">
                <FiChevronDown className="text-[#3C7DD1]" size={20} />
              </div>
            </div>
          </div>
          
          {/* แผนใหม่ */}
          <div className="bg-white border border-gray-200 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">แผนใหม่</p>
            <div className="flex flex-col items-center">
              <p className="text-2xl font-semibold text-[#3C7DD1]">
                {activeTab === 'time' ? `${newPlanTimeInMonths} เดือน` : `${formatNumber(newPlanMonthlyPayment)} บาท`}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Savings */}
        <div className="bg-[#FFF8E5] border border-[#FFEEBA] p-3 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-gray-700 mb-1">
              {activeTab === 'time' ? 'ลดลงไป' : 'ประหยัดไป'}
            </p>
            <p className="text-2xl font-semibold text-[#F59E0B]">
              {activeTab === 'time' ? `${savedTimeInMonths} เดือน` : `${formatNumber(savedAmount)} บาท`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

