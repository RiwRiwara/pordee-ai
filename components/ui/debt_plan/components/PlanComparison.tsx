import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface PlanComparisonProps {
  showComparisonDetails: boolean;
  setShowComparisonDetails: (value: boolean) => void;
  originalTimeInMonths: number;
  originalMonthlyPayment: number;
  reducedTimeInMonths: number;
  reducedMonthlyPayment: number;
  acceleratedTimeInMonths: number;
  acceleratedMonthlyPayment: number;
  formatNumber: (num: number) => string;
}

export default function PlanComparison({
  showComparisonDetails,
  setShowComparisonDetails,
  originalTimeInMonths,
  originalMonthlyPayment,
  reducedTimeInMonths,
  reducedMonthlyPayment,
  acceleratedTimeInMonths,
  acceleratedMonthlyPayment,
  formatNumber,
}: PlanComparisonProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowComparisonDetails(!showComparisonDetails)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowComparisonDetails(!showComparisonDetails);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <h3 className="font-medium">เปรียบเทียบแผนการชำระหนี้</h3>
        {showComparisonDetails ? <FiChevronUp /> : <FiChevronDown />}
      </div>

      {showComparisonDetails && (
        <div className="mt-3 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="font-medium">แผนการชำระหนี้</div>
            <div className="font-medium">ระยะเวลา</div>
            <div className="font-medium">จำนวนเงิน/เดือน</div>
          </div>

          {/* Original Plan */}
          <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
            <div>แผนปกติ</div>
            <div>{originalTimeInMonths} เดือน</div>
            <div>{formatNumber(originalMonthlyPayment)} บาท</div>
          </div>

          {/* Reduced Time Plan */}
          <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
            <div>แผนลดระยะเวลา</div>
            <div className="font-medium text-green-600">
              {reducedTimeInMonths} เดือน (-
              {originalTimeInMonths - reducedTimeInMonths})
            </div>
            <div className="text-orange-600">
              +{formatNumber(reducedMonthlyPayment - originalMonthlyPayment)}{" "}
              บาท
            </div>
          </div>

          {/* Accelerated Payment Plan */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>แผนเร่งชำระ</div>
            <div className="font-medium text-green-600">
              {acceleratedTimeInMonths} เดือน (-
              {originalTimeInMonths - acceleratedTimeInMonths})
            </div>
            <div className="text-orange-600">
              +
              {formatNumber(acceleratedMonthlyPayment - originalMonthlyPayment)}{" "}
              บาท
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2">
            หมายเหตุ: แผนปัจจุบันอ้างอิงจากเงื่อนไขขั้นต่ำของสัญญา
            แผนลดระยะเวลาและแผนเร่งชำระจะเพิ่มเงินชำระรายเดือนเพื่อลดระยะเวลาในการชำระหนี้
          </div>
        </div>
      )}
    </div>
  );
}
