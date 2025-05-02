import React from "react";

import { DebtItem } from "../types";

import DebtCard from "./DebtCard";

interface DebtTypeSectionProps {
  title: string;
  debts: DebtItem[];
  formatNumber: (num: number) => string;
  onEdit: (debt: DebtItem) => void;
  interestRateColor: string;
}

export default function DebtTypeSection({
  title,
  debts,
  formatNumber,
  onEdit,
  interestRateColor,
}: DebtTypeSectionProps) {
  if (debts.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="mb-0 mt-2 text-lg font-semibold text-[#3776C1]">
        {title}
      </h2>
      <div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
          {debts.map((debt) => (
            <DebtCard
              key={debt._id}
              debt={debt}
              formatNumber={formatNumber}
              interestRateColor={interestRateColor}
              onEdit={onEdit}
            />
          ))}
        </div>
      </div>
    </>
  );
}
