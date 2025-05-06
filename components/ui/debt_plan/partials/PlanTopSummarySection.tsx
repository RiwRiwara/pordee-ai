import React from 'react';
import { FiInfo } from 'react-icons/fi';
import { formatNumber } from '../utils/debtPlanUtils';

// Goal type to strategy mapping
const GOAL_STRATEGY_MAP: Record<string, string> = {
  "เห็นผลเร็ว": "Snowball",
  "คุ้มที่สุด": "Avalanche",
  "สมดุล": "Proportional",
  "แผนสมดุล": "Proportional",
  "คุ้มดอกเบี้ย": "Avalanche",
  "ประหยัดดอกเบี้ย": "Avalanche"
};

// Goal type descriptions
const GOAL_DESCRIPTIONS: Record<string, string> = {
  "เห็นผลเร็ว": "เลือกจ่ายหนี้ก้อนเล็กก่อน เพื่อปลดหนี้ก้อนแรกได้ไว",
  "คุ้มที่สุด": "โฟกัสหนี้ดอกเบี้ยสูง ลดต้นทุนได้มากที่สุด",
  "สมดุล": "ผสมผสานวิธีการชำระหนี้ เพื่อสมดุลระหว่างความเร็วและความคุ้มค่า",
  "แผนสมดุล": "ผสมผสานวิธีการชำระหนี้ เพื่อสมดุลระหว่างความเร็วและความคุ้มค่า",
  "คุ้มดอกเบี้ย": "โฟกัสหนี้ดอกเบี้ยสูง ลดต้นทุนได้มากที่สุด",
  "ประหยัดดอกเบี้ย": "โฟกัสหนี้ดอกเบี้ยสูง ลดต้นทุนได้มากที่สุด"
};

// Strategy descriptions
const STRATEGY_DESCRIPTIONS: Record<string, string> = {
  "Snowball": "เริ่มจากหนี้ก้อนเล็กไปหาก้อนใหญ่",
  "Avalanche": "เริ่มจากหนี้ดอกเบี้ยสูงสุดก่อน",
  "Proportional": "กระจายการชำระอย่างสมดุล"
};

interface PlanTopSummarySectionProps {
  goalType: string;
  paymentStrategy: string;
  riskPercentage: number;
  getRiskStatusDisplay: () => JSX.Element;
  timeInMonths?: number;
  totalInterest?: number;
  monthlyPayment?: number;
}

export default function PlanTopSummarySection({
  goalType,
  paymentStrategy,
  getRiskStatusDisplay,
  timeInMonths,
  totalInterest,
  monthlyPayment,
}: PlanTopSummarySectionProps) {
  // Get strategy based on goal type if not explicitly provided
  const displayStrategy = paymentStrategy || GOAL_STRATEGY_MAP[goalType] || 'Snowball';
  
  // Get descriptions for goal type and strategy
  const goalDescription = GOAL_DESCRIPTIONS[goalType] || '';
  const strategyDescription = STRATEGY_DESCRIPTIONS[displayStrategy] || '';
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <p className="text-sm text-gray-600">เป้าหมายที่เลือก:</p>
        <p className="font-medium">{goalType}</p>
        {goalDescription && (
          <p className="text-xs text-gray-500">{goalDescription}</p>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600">รูปแบบแผนการชำระหนี้:</p>
        <p className="font-medium">{displayStrategy}</p>
        {strategyDescription && (
          <p className="text-xs text-gray-500">{strategyDescription}</p>
        )}
      </div>
      {getRiskStatusDisplay()}
    </div>
  );
}
