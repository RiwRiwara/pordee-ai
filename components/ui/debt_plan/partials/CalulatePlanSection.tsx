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
  return (
    <div className="grid grid-cols-2 gap-4 my-4">
      {/* Left Column - เวลาที่ใช้ */}
      <div>
        <div className="bg-[#3C7DD1] text-white py-2 rounded-lg flex items-center justify-center gap-2 mb-4">
          <FiClock size={18} />
          <span>เวลาที่ใช้</span>
        </div>
        
        <div className="space-y-2">
          {/* แผนเดิม */}
          <div className="bg-white border border-gray-200 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">แผนเดิม</p>
              <p className="text-xl font-semibold text-gray-900">{originalTimeInMonths} เดือน</p>
            </div>
          </div>
          
          {/* Down Arrow */}
          <div className="flex justify-center">
            <FiChevronDown className="text-[#3C7DD1]" size={20} />
          </div>
          
          {/* แผนใหม่ */}
          <div className="bg-white border border-gray-200 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">แผนใหม่</p>
              <p className="text-xl font-semibold text-[#3C7DD1]">{newPlanTimeInMonths} เดือน</p>
            </div>
          </div>
          
          {/* ลดลงไป */}
          <div className="bg-[#FFF8E5] border border-[#FFEEBA] p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-700">ลดลงไป</p>
              <p className="text-xl font-semibold text-[#F59E0B]">{savedTimeInMonths} เดือน</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Column - ดอกเบี้ยที่ใช้ */}
      <div>
        <div className="bg-[#3C7DD1] text-white py-2 rounded-lg flex items-center justify-center gap-2 mb-4">
          <FiDollarSign size={18} />
          <span>ดอกเบี้ยที่ใช้</span>
        </div>
        
        <div className="space-y-2">
          {/* แผนเดิม */}
          <div className="bg-white border border-gray-200 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">แผนเดิม</p>
              <p className="text-xl font-semibold text-gray-900">{formatNumber(originalMonthlyPayment)} บาท</p>
            </div>
          </div>
          
          {/* Down Arrow */}
          <div className="flex justify-center">
            <FiChevronDown className="text-[#3C7DD1]" size={20} />
          </div>
          
          {/* แผนใหม่ */}
          <div className="bg-white border border-gray-200 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">แผนใหม่</p>
              <p className="text-xl font-semibold text-[#3C7DD1]">{formatNumber(newPlanMonthlyPayment)} บาท</p>
            </div>
          </div>
          
          {/* ประหยัดไป */}
          <div className="bg-[#FFF8E5] border border-[#FFEEBA] p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-700">ประหยัดไป</p>
              <p className="text-xl font-semibold text-[#F59E0B]">{formatNumber(savedAmount)} บาท</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

