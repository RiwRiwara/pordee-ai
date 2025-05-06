import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Spinner } from "@heroui/spinner";

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

export default function RemaingMonth() {
  const { data: session } = useSession();
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [percentagePaid, setPercentagePaid] = useState(0);

  // Format with commas for display
  const formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Load debt data
  useEffect(() => {
    const fetchDebts = async () => {
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("/api/debts");

        if (!response.ok) {
          throw new Error(`Error fetching debts: ${response.status}`);
        }
        
        const { debts } = await response.json();

        // Filter out debts with invalid data
        const validDebts = (debts || []).filter((debt: any) => 
          debt && typeof debt.remainingAmount === 'number' && 
          typeof debt.totalAmount === 'number'
        );

        setDebts(validDebts);

        // Calculate totals
        const remaining = validDebts.reduce(
          (sum: number, debt: DebtItem) => sum + debt.remainingAmount,
          0,
        );
        const totalDebt = validDebts.reduce(
          (sum: number, debt: DebtItem) => sum + debt.totalAmount,
          0,
        );
        const paid = totalDebt - remaining;
        const percentage =
          totalDebt > 0 ? Math.round((paid / totalDebt) * 100) : 0;

        setTotalRemaining(remaining);
        setTotalPaid(paid);
        setPercentagePaid(percentage);
      } catch (error) {
        console.error("Error fetching debts:", error);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        setDebts([]);
        setTotalRemaining(0);
        setTotalPaid(0);
        setPercentagePaid(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebts();
  }, [session]);  // Re-fetch when session changes

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" color="primary" />
          <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-700">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลหนี้ของคุณ</p>
        </div>
      </div>
    );
  }
  
  if (debts.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-700">คุณยังไม่มีรายการหนี้ในระบบ</p>
        </div>
      </div>
    );
  }

  // Calculate the current month and year for display
  const currentDate = new Date();
  const thaiMonthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const currentMonth = thaiMonthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear() + 543; // Convert to Buddhist Era

  return (
    <div className="p-4">
      <div className="bg-[#FED174] rounded-xl p-6">
        <h2 className="text-xl font-bold text-center mb-1">
          ยอดเงินคงเหลือที่ต้องชำระ
        </h2>
        <p className="text-center text-sm text-gray-700 mb-4">
          {currentMonth} {currentYear}
        </p>

        <div className="flex justify-center">
          <div className="text-center">
            <p className="text-4xl font-bold text-[#3776C1]">
              {formatNumber(totalRemaining)} บาท
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="bg-gray-200 h-8 rounded-full overflow-hidden">
            <div
              className="bg-[#3776C1] h-full rounded-full"
              style={{ width: `${percentagePaid}%` }}
            />
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-4">
              <div className="bg-[#3776C1] text-white px-4 py-1 rounded-full text-sm font-medium">
                {formatNumber(totalPaid)}
                <span className="ml-1">ชำระแล้ว</span>
              </div>
              <div className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {percentagePaid}%
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-2 text-sm">
          <span>ชำระแล้ว</span>
          <span>ยอดเงินทั้งหมดที่ต้องชำระ</span>
        </div>
      </div>
    </div>
  );
}
