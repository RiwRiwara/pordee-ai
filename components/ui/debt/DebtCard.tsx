import React from "react";
import { Button } from "@heroui/button";
import { FiEdit } from "react-icons/fi";

import { DebtItem } from "../types";

interface DebtCardProps {
  debt: DebtItem;
  formatNumber: (num: number) => string;
  onEdit: (debt: DebtItem) => void;
  interestRateColor?: string;
}

export default function DebtCard({
  debt,
  formatNumber,
  onEdit,
  interestRateColor = "bg-blue-500",
}: DebtCardProps) {
  return (
    <div key={debt._id} className="mb-3 rounded-lg bg-white p-4 shadow-sm">
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
          <p className="text-lg font-bold text-[#3776C1]">
            {formatNumber(debt.remainingAmount)} THB
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {debt.originalPaymentType === "revolving" ||
            debt.debtType === "บัตรเครดิต"
              ? "ขั้นต่ำต่อเดือน:"
              : "ค่าผ่อนต่อเดือน:"}
          </p>
          <p className="font-medium text-yellow-600">
            {formatNumber(debt.minimumPayment || 0)} THB
          </p>
        </div>
        <div className="flex gap-2">
          <div
            className={`flex h-8 items-center justify-center rounded-md ${interestRateColor} px-3 text-white`}
          >
            <p className="text-sm font-bold">{debt.interestRate}%</p>
          </div>
          <Button
            className="px-2"
            color="primary"
            size="sm"
            variant="ghost"
            onPress={() => onEdit(debt)}
          >
            <FiEdit size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
