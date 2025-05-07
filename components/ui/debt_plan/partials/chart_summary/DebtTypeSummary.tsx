import React from 'react';
import { DebtPlanData } from '../types';
import { FiInfo } from 'react-icons/fi';

interface DebtTypeSummaryProps {
  currentDebtType: {
    id: string;
    label: string;
  };
  debtData: DebtPlanData;
}

const DebtTypeSummary: React.FC<DebtTypeSummaryProps> = ({
  currentDebtType,
  debtData,
}) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Calculate savings
  const savedAmount = debtData.originalInterest - debtData.newPlanInterest;
  const savedMonths = debtData.originalTimeInMonths - debtData.newPlanTimeInMonths;
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {/* Debt Type Title */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">{currentDebtType.label}</h3>
      </div>

      {/* Summary data */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">ยอดหนี้</p>
          <p className="font-semibold">{formatNumber(debtData.originalTotalAmount)} บาท</p>
        </div>
        <div>
          <p className="text-gray-500">ระยะเวลาชำระ</p>
          <div className="flex items-center">
            <p className="font-semibold">{debtData.newPlanTimeInMonths} เดือน</p>
            {savedMonths > 0 && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                -{savedMonths} เดือน
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="text-gray-500">ดอกเบี้ยทั้งหมด</p>
          <div className="flex items-center">
            <p className="font-semibold">{formatNumber(debtData.newPlanInterest)} บาท</p>
            {savedAmount > 0 && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                -฿{formatNumber(savedAmount)}
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="text-gray-500">แผนชำระใหม่</p>
          <p className="font-semibold text-blue-600">
            {Math.ceil(debtData.newPlanTotalAmount / debtData.newPlanTimeInMonths).toLocaleString('th-TH')} บาท/เดือน
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebtTypeSummary;
