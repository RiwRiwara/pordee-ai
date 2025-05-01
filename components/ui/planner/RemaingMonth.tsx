import React, { useState, useEffect } from "react";

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
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      try {
        setIsLoading(true);
        const response = await fetch("/api/debts");

        if (response.ok) {
          const { debts } = await response.json();

          setDebts(debts || []);

          // Calculate totals
          const remaining = debts.reduce(
            (sum: number, debt: DebtItem) => sum + debt.remainingAmount,
            0,
          );
          const totalDebt = debts.reduce(
            (sum: number, debt: DebtItem) => sum + debt.totalAmount,
            0,
          );
          const paid = totalDebt - remaining;
          const percentage =
            totalDebt > 0 ? Math.round((paid / totalDebt) * 100) : 0;

          setTotalRemaining(remaining);
          setTotalPaid(paid);
          setPercentagePaid(percentage);
        }
      } catch (error) {
        console.error("Error fetching debts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebts();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-[#FED174] rounded-xl p-6">
        <h2 className="text-xl font-bold text-center mb-4">
          ยอดเงินคงเหลือที่ต้องชำระ
        </h2>

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
