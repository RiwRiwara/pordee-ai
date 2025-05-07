import React, { useState, useEffect } from "react";

import MyDebtCarosel from "../debt_plan/partials/MyDebtCarosel";

interface DebtItem {
  _id: string;
  name: string;
  debtType: string;
  originalPaymentType?: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  paymentDueDay?: number;
}

export default function MyDebt() {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ทั้งหมด");

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
        }
      } catch (error) {
        console.error("Error fetching debts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebts();
  }, []);

  // Filter debts based on selected filter
  const filteredDebts = debts.filter((debt) => {
    if (activeFilter === "ทั้งหมด") return true;
    if (activeFilter === "บัตรเครดิต")
      return (
        debt.debtType === "บัตรเครดิต" ||
        debt.originalPaymentType === "credit_card"
      );
    if (activeFilter === "บัตรกดเงินสด")
      return debt.originalPaymentType === "cash_card";
    if (activeFilter === "เงินกู้อนุมัติ")
      return (
        debt.debtType === "สินเชื่อ" || debt.originalPaymentType === "loan"
      );
    if (activeFilter === "สินเชื่อส่วนบุคคล")
      return debt.originalPaymentType === "personal_loan";
    if (activeFilter === "สินเชื่อที่อยู่อาศัย")
      return debt.originalPaymentType === "mortgage";
    if (activeFilter === "สินเชื่อรถยนต์")
      return debt.originalPaymentType === "auto_loan";

    return false;
  });

  // Debt type filters
  const debtFilters = [
    "ทั้งหมด",
    "บัตรเครดิต",
    "บัตรกดเงินสด",
    "เงินกู้อนุมัติ",
    "สินเชื่อส่วนบุคคล",
    "สินเชื่อที่อยู่อาศัย",
    "สินเชื่อรถยนต์",
  ];

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">หนี้ของฉัน</h2>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4" />
          <div className="h-32 bg-gray-200 rounded mb-4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[#3776C1]">หนี้ของฉัน</h2>

      {/* Debt Type Filters */}
      <div className="mb-4 ">
        <div className="flex flex-wrap justify-start gap-2 ">
          {debtFilters.map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-xs whitespace-nowrap ${activeFilter === filter ? "bg-yellow-400 text-gray-900 font-bold" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Debt Cards Carousel */}
      <MyDebtCarosel
        activeFilter={activeFilter}
        debts={debts}
        formatNumber={formatNumber}
      />
    </div>
  );
}
