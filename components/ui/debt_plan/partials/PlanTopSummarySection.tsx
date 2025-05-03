import React from 'react';
import { FiInfo } from 'react-icons/fi';
import { formatNumber } from '../utils/debtPlanUtils';

interface PlanTopSummarySectionProps {
  goalType: string;
  paymentStrategy: string;
  riskPercentage: number;
  getRiskStatusDisplay: () => JSX.Element;
}

export default function PlanTopSummarySection({
  goalType,
  paymentStrategy,
  getRiskStatusDisplay,
}: PlanTopSummarySectionProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <p className="text-sm text-gray-600">เป้าหมายที่เลือก:</p>
        <p className="font-medium">{goalType}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">รูปแบบแผนการชำระหนี้:</p>
        <p className="font-medium">{paymentStrategy}</p>
      </div>
      {getRiskStatusDisplay()}
    </div>
  );
}
