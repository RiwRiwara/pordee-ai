import React from "react";
import { CalendarIcon, LineChartIcon } from "lucide-react";

type PlannerSummaryProps = {
  totalDebt?: number;
  paidDebt?: number;
  remainingDebt?: number;
  paymentPercentage?: number;
  goalType?: string;
  paymentStrategy?: string;
  monthlyPayment?: number;
  timeInMonths?: number;
  totalInterest?: number;
  completionDate?: string;
};

export default function PlannerSummary({
  totalDebt = 254200,
  paidDebt = 69200,
  remainingDebt = 185000,
  paymentPercentage = 28,
  goalType = "เห็นผลเร็ว",
  paymentStrategy = "Snowball",
  monthlyPayment = 11200,
  timeInMonths = 30,
  totalInterest = 24500,
  completionDate = "ก.ค. 2027",
}: PlannerSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Debt Overview Card */}
      <div className="rounded-xl p-4 bg-[#3776C1] text-white shadow-sm">
        <h2 className="text-center text-lg font-medium mb-3">ยอดหนี้คงเหลือทั้งหมดของคุณ</h2>
        <div className="bg-white text-blue-600 rounded-lg py-2 px-4 text-center mb-3">
          <span className="text-3xl font-bold">{remainingDebt.toLocaleString()} บาท</span>
        </div>
        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden mb-1">
          <div 
            className="absolute top-0 left-0 h-full bg-yellow-400" 
            style={{ width: `${paymentPercentage}%` }}
          ></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <span className="text-xs font-medium">{paymentPercentage}%</span>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-yellow-400 rounded-full mr-2"></div>
            <span>ชำระแล้ว</span>
            <span className="ml-2 font-medium">{paidDebt.toLocaleString()}</span>
          </div>
          <span className="font-medium">{totalDebt.toLocaleString()}</span>
        </div>
      </div>

      {/* Plan Summary Card */}
      <div className="rounded-xl p-4 bg-[#3776C1] text-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">สรุปภาพรวมแผนของคุณ</h2>
          <button className="bg-yellow-400 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            ปรับแผน
            <span className="ml-1 text-xs">อะ</span>
          </button>
        </div>

        <div className="bg-white text-blue-900 rounded-lg p-4 mb-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">เป้าหมายที่เลือก :</span>
              <span className="font-medium">{goalType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">รูปแบบแผนการชำระหนี้ :</span>
              <span className="font-medium">{paymentStrategy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">เงินต่อเดือนที่ต้องใช้ :</span>
              <span className="font-medium">{monthlyPayment.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">เวลาที่ใช้ :</span>
              <span className="font-medium">{timeInMonths} เดือน</span>
            </div>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="space-y-2">
          <button className="w-full bg-white text-blue-900 rounded-lg py-2 px-4 flex items-center justify-center text-sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>หาชำระหนี้ตามแผนคุณจะปลดหนี้ได้ภายใน {completionDate}</span>
          </button>
          <button className="w-full bg-white text-blue-900 rounded-lg py-2 px-4 flex items-center justify-center text-sm">
            <LineChartIcon className="h-4 w-4 mr-2" />
            <span>ดอกเบี้ยรวมที่ต้องจ่าย {totalInterest.toLocaleString()} บาท</span>
          </button>
        </div>
      </div>
    </div>
  );
}
