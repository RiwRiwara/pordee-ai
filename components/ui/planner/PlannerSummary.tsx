import React, { useState, useEffect } from "react";
import { CalendarIcon, LineChartIcon } from "lucide-react";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";

interface DebtItem {
  _id: string;
  name: string;
  debtType: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  paymentDueDay?: number;
}

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

export default function PlannerSummary(props: PlannerSummaryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [totalDebt, setTotalDebt] = useState(0);
  const [remainingDebt, setRemainingDebt] = useState(0);
  const [paidDebt, setPaidDebt] = useState(0);
  const [paymentPercentage, setPaymentPercentage] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  
  // Default values for strategy data that might not be in the API yet
  const goalType = props.goalType || "เห็นผลเร็ว";
  const paymentStrategy = props.paymentStrategy || "Snowball";
  const timeInMonths = props.timeInMonths || 30;
  const totalInterest = props.totalInterest || 24500;
  const completionDate = props.completionDate || "ก.ค. 2027";

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Calculate estimated completion date
  const calculateCompletionDate = (monthsFromNow: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);
    const month = date.toLocaleString('th-TH', { month: 'short' });
    const year = date.getFullYear() + 543; // Convert to Buddhist Era
    return `${month} ${year}`;
  };

  // Load debt data
  useEffect(() => {
    const fetchDebts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/debts');
        
        if (response.ok) {
          const { debts } = await response.json();
          
          // Calculate totals
          const total = debts.reduce((sum: number, debt: DebtItem) => sum + debt.totalAmount, 0);
          const remaining = debts.reduce((sum: number, debt: DebtItem) => sum + debt.remainingAmount, 0);
          const paid = total - remaining;
          const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;
          
          // Calculate monthly payment (sum of all minimum payments)
          const monthly = debts.reduce((sum: number, debt: DebtItem) => {
            return sum + (debt.minimumPayment || 0);
          }, 0);
          
          setTotalDebt(total);
          setRemainingDebt(remaining);
          setPaidDebt(paid);
          setPaymentPercentage(percentage);
          setMonthlyPayment(monthly);
        }
      } catch (error) {
        console.error('Error fetching debts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebts();
  }, []);
  
  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl p-4 bg-[#3776C1] text-white shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-blue-300 rounded mb-3"></div>
            <div className="h-10 bg-white rounded mb-3"></div>
            <div className="h-6 bg-blue-300 rounded"></div>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debt Overview Card */}
      <div className="rounded-xl p-4 bg-[#3776C1] text-white shadow-sm">
        <h2 className="text-center text-lg font-medium mb-3">ยอดหนี้คงเหลือทั้งหมดของคุณ</h2>
        <div className="bg-white text-[#3776C1] rounded-lg py-2 px-4 text-center mb-3">
          <span className="text-3xl font-bold">{formatNumber(remainingDebt)} บาท</span>
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
            <span className="ml-2 font-medium">{formatNumber(paidDebt)}</span>
          </div>
          <span className="font-medium">{formatNumber(totalDebt)}</span>
        </div>
      </div>

      {/* Plan Summary Card */}
      <div className="rounded-xl p-4 bg-[#3776C1] text-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">สรุปภาพรวมแผนของคุณ</h2>
          <button className="bg-yellow-400 text-[#3776C1] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            ปรับแผน
            <HiAdjustmentsHorizontal className="" />
          </button>
        </div>

        <div className="bg-white text-[#3776C1] rounded-lg p-4 mb-3">
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
              <span className="font-medium">{formatNumber(monthlyPayment)} บาท</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">เวลาที่ใช้ :</span>
              <span className="font-medium">{timeInMonths} เดือน</span>
            </div>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="space-y-2">
          <button className="w-full bg-white text-[#3776C1] rounded-lg py-2 px-4 flex items-center justify-center text-sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>หากชำระหนี้ตามแผนคุณจะปลดหนี้ได้ภายใน {monthlyPayment > 0 ? calculateCompletionDate(Math.ceil(remainingDebt / monthlyPayment)) : completionDate}</span>
          </button>
          <button className="w-full bg-white text-[#3776C1] rounded-lg py-2 px-4 flex items-center justify-center text-sm">
            <LineChartIcon className="h-4 w-4 mr-2" />
            <span>ดอกเบี้ยรวมที่ต้องจ่าย {formatNumber(totalInterest)} บาท</span>
          </button>
        </div>
      </div>
    </div>
  );
}
