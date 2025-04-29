import React from "react";
import { Button } from "@heroui/button";

interface DebtItem {
  _id: string;
  name: string;
  debtType: string; // Thai values: "บัตรเครดิต", "สินเชื่อ", "อื่นๆ"
  originalPaymentType?: string; // Optional original payment type (for guest mode)
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  paymentDueDay?: number;
  startDate?: string;
  estimatedPayoffDate?: string;
  notes?: string;
  attachments?: any[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AllDebtSectionProps {
  debts: DebtItem[];
  onAddDebt: () => void;
}

export default function AllDebtSection({
  debts = [],
  onAddDebt,
}: AllDebtSectionProps) {
  // Format with commas for display
  const formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Show loading state when no debts are available yet
  if (debts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">หนี้ทั้งหมด</h2>
          <Button color="primary" size="sm" onPress={onAddDebt}>
            <span className="mr-1">+</span>
            เพิ่มหนี้
          </Button>
        </div>
        <p className="text-gray-500 text-center py-6">
          ไม่พบรายการหนี้ กรุณาเพิ่มหนี้เพื่อวางแผน
        </p>
      </div>
    );
  }

  // Filter based on debtType Thai values
  // Credit card types are treated as revolving debt
  const revolving = debts.filter(
    (debt) =>
      debt.debtType === "บัตรเครดิต" ||
      debt.originalPaymentType === "revolving" ||
      debt.originalPaymentType === "credit_card" ||
      debt.originalPaymentType === "cash_card",
  );

  // Loan types are treated as installment debt
  const installment = debts.filter(
    (debt) =>
      debt.debtType === "สินเชื่อ" ||
      debt.originalPaymentType === "installment" ||
      debt.originalPaymentType === "loan" ||
      debt.originalPaymentType === "mortgage",
  );

  // Other debts can be put in either category based on your preference
  // Here we're adding "อื่นๆ" (others) to installment category
  const otherDebts = debts.filter(
    (debt) => debt.debtType === "อื่นๆ" && !debt.originalPaymentType,
  );

  // Add other debts to installment for display
  if (otherDebts.length > 0) {
    installment.push(...otherDebts);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="">
        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">
            หนี้หมุนเวียน (Revolving Debt)
          </h2>
          {revolving.map((debt) => (
            <div
              key={debt._id}
              className="mb-3 rounded-lg bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{debt.name}</h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">วันที่ชำระ:</span>
                    <span className="ml-1 text-sm font-medium">
                      {debt.paymentDueDay} ทุกเดือน
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {formatNumber(debt.remainingAmount)} THB
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">ขั้นต่ำต่อเดือน:</p>
                  <p className="font-medium">
                    {formatNumber(debt.minimumPayment || 0)} THB
                  </p>
                </div>
                <div className="flex h-8 items-center justify-center rounded-md bg-blue-500 px-3 text-white">
                  <p className="text-sm font-bold">{debt.interestRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Installment Debt Section */}
      <div className="">
        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">
            หนี้ส่งผ่อน (Installment Debt)
          </h2>
          {installment.map((debt) => (
            <div
              key={debt._id}
              className="mb-3 rounded-lg bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{debt.name}</h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">วันที่ชำระ:</span>
                    <span className="ml-1 text-sm font-medium">
                      {debt.paymentDueDay} ทุกเดือน
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {formatNumber(debt.remainingAmount)} THB
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">ค่าผ่อนต่อเดือน:</p>
                  <p className="font-medium">
                    {formatNumber(debt.minimumPayment || 0)} THB
                  </p>
                </div>
                <div className="flex h-8 items-center justify-center rounded-md bg-green-500 px-3 text-white">
                  <p className="text-sm font-bold">{debt.interestRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Add Debt Button */}
        <Button
          className="mt-1 w-full border border-dashed border-gray-300 py-6 text-gray-500"
          variant="flat"
          onPress={onAddDebt}
        >
          + เพิ่มรายการหนี้
        </Button>
      </div>
    </div>
  );
}
