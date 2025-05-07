import React, { useEffect, useState } from "react";
import { FiDollarSign, FiChevronDown } from "react-icons/fi";

import { formatNumber } from "../utils/debtPlanUtils";

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
  originalTimeInMonths = 5,
  originalMonthlyPayment = 6000,
  newPlanTimeInMonths = 4,
  newPlanMonthlyPayment = 4200,
  savedTimeInMonths: propSavedTimeInMonths,
  savedAmount: propSavedAmount,
  currentDebtTypeId = "total",
}: CalculatePlanSectionProps) {
  // Use state to track values and ensure reactivity
  const [calculatedValues, setCalculatedValues] = useState({
    savedTimeInMonths: 0,
    savedAmount: 0,
    originalTotalInterest: 0,
    newPlanTotalInterest: 0,
    timeSavingsPercentage: 0,
    amountSavingsPercentage: 0,
  });

  // Recalculate values whenever props change
  useEffect(() => {
    // Calculate the correct savedTimeInMonths based on the difference
    const calculatedSavedTimeInMonths =
      propSavedTimeInMonths ??
      Math.max(0, originalTimeInMonths - newPlanTimeInMonths);

    // Calculate total payments for both plans
    const calculatedOriginalTotalInterest =
      originalTimeInMonths * originalMonthlyPayment;
    const calculatedNewPlanTotalInterest =
      newPlanTimeInMonths * newPlanMonthlyPayment;

    // Calculate the correct savedAmount based on the difference in total payments
    const calculatedSavedAmount =
      propSavedAmount ??
      Math.max(
        0,
        calculatedOriginalTotalInterest - calculatedNewPlanTotalInterest,
      );

    // Calculate percentage savings
    const timeSavingsPercentage =
      originalTimeInMonths > 0
        ? Math.round((calculatedSavedTimeInMonths / originalTimeInMonths) * 100)
        : 0;

    const amountSavingsPercentage =
      calculatedOriginalTotalInterest > 0
        ? Math.round(
            (calculatedSavedAmount / calculatedOriginalTotalInterest) * 100,
          )
        : 0;

    // Update state with new calculations
    setCalculatedValues({
      savedTimeInMonths: calculatedSavedTimeInMonths,
      savedAmount: calculatedSavedAmount,
      originalTotalInterest: calculatedOriginalTotalInterest,
      newPlanTotalInterest: calculatedNewPlanTotalInterest,
      timeSavingsPercentage,
      amountSavingsPercentage,
    });
  }, [
    originalTimeInMonths,
    originalMonthlyPayment,
    newPlanTimeInMonths,
    newPlanMonthlyPayment,
    propSavedTimeInMonths,
    propSavedAmount,
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 my-4">
      {/* Right Column - ดอกเบี้ยที่ใช้ */}
      <div>
        <div className="bg-[#3C7DD1] text-white py-2 rounded-lg flex items-center justify-center gap-2 mb-4">
          <FiDollarSign size={18} />
          <span>ดอกเบี้ย / ระยะเวลา</span>
        </div>

        <div className="space-y-2">
          {/* แผนเดิม */}
          <div className="bg-white border border-gray-200 rounded-lg flex">
            <div className="p-3 flex-1">
              <p className="text-xs text-gray-500">แผนเดิม</p>
              <p className="text-md font-semibold">
                {originalMonthlyPayment > 0
                  ? formatNumber(originalMonthlyPayment)
                  : "-"}{" "}
                {originalMonthlyPayment > 0 ? "บาท" : ""}
              </p>
            </div>

            <div className="border-l border-gray-200 p-3 flex-1">
              <p className="text-xs text-gray-500">ระยะเวลาชำระ</p>
              <p className="text-md font-semibold">
                {originalTimeInMonths > 0 ? originalTimeInMonths : "-"}{" "}
                {originalTimeInMonths > 0 ? "เดือน" : ""}
              </p>
            </div>
          </div>

          {/* Down Arrow */}
          <div className="flex justify-center">
            <FiChevronDown className="text-[#3C7DD1]" size={20} />
          </div>

          {/* แผนใหม่ */}
          <div className="bg-white border border-gray-200 rounded-lg flex">
            <div className="p-3 flex-1">
              <p className="text-xs text-gray-500">แผนใหม่</p>
              <p className="text-md font-semibold text-[#3C7DD1]">
                {newPlanMonthlyPayment > 0
                  ? formatNumber(newPlanMonthlyPayment)
                  : "-"}{" "}
                {newPlanMonthlyPayment > 0 ? "บาท" : ""}
              </p>
            </div>

            <div className="border-l border-gray-200 p-3 flex-1">
              <p className="text-xs text-gray-500">ระยะเวลาชำระ</p>
              <p className="text-md font-semibold text-[#3C7DD1]">
                {newPlanTimeInMonths > 0 ? newPlanTimeInMonths : "-"}{" "}
                {newPlanTimeInMonths > 0 ? "เดือน" : ""}
              </p>
            </div>
          </div>

          {/* ประหยัดไป */}
          <div className="bg-[#FFF8E5] border border-[#FFEEBA] rounded-lg flex">
            <div className="p-3 flex-1">
              <p className="text-xs text-gray-700">ประหยัดเงิน</p>
              <p className="text-md font-semibold text-[#F59E0B]">
                {calculatedValues.savedAmount > 0
                  ? formatNumber(calculatedValues.savedAmount)
                  : "-"}{" "}
                {calculatedValues.savedAmount > 0 ? "บาท" : ""}
              </p>
              {calculatedValues.savedAmount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  ประหยัด {calculatedValues.amountSavingsPercentage}%
                </p>
              )}
            </div>

            <div className="border-l border-gray-200 p-3 flex-1">
              <p className="text-xs text-gray-700">ลดระยะเวลา</p>
              <p className="text-md font-semibold text-[#F59E0B]">
                {calculatedValues.savedTimeInMonths > 0
                  ? calculatedValues.savedTimeInMonths
                  : "-"}{" "}
                {calculatedValues.savedTimeInMonths > 0 ? "เดือน" : ""}
              </p>
              {calculatedValues.savedTimeInMonths > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  เร็วขึ้น {calculatedValues.timeSavingsPercentage}%
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
