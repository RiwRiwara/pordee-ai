import React from "react";
import { FiInfo, FiChevronUp, FiChevronDown } from "react-icons/fi";

import { formatNumber } from "../utils/debtPlanUtils";

interface AiAdvisorSectionProps {
  showAIRecommendation: boolean;
  setShowAIRecommendation: (show: boolean) => void;
  monthlyPayment: number;
  timeInMonths: number;
}

export default function AiAdvisorSection({
  showAIRecommendation,
  setShowAIRecommendation,
  monthlyPayment,
  timeInMonths,
}: AiAdvisorSectionProps) {
  return (
    <div className="mb-4">
      <button
        aria-controls="ai-recommendation-content"
        aria-expanded={showAIRecommendation}
        className="w-full flex items-center justify-between bg-blue-50 p-3 rounded-t-lg cursor-pointer"
        type="button"
        onClick={() => setShowAIRecommendation(!showAIRecommendation)}
      >
        <div className="flex items-center">
          <FiInfo className="text-blue-500 mr-2" />
          <span className="font-medium">ดูคำแนะนำจาก AI Advisor</span>
        </div>
        {showAIRecommendation ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {showAIRecommendation && (
        <div
          className="bg-blue-50 p-3 rounded-b-lg"
          id="ai-recommendation-content"
        >
          <p className="text-sm">
            จากการวิเคราะห์ข้อมูลหนี้ของคุณ เราแนะนำให้เพิ่มยอดชำระต่อเดือนเป็น{" "}
            {formatNumber(monthlyPayment * 1.2)} บาท
            เพื่อลดระยะเวลาการชำระหนี้ลงเหลือ {Math.round(timeInMonths * 0.8)}{" "}
            เดือน และประหยัดดอกเบี้ยได้ถึง{" "}
            {formatNumber(monthlyPayment * timeInMonths * 0.05 * 0.2)} บาท
          </p>
          <p className="text-sm mt-2">
            หากคุณใช้กลยุทธ์ Snowball คุณควรชำระหนี้ตามลำดับต่อไปนี้:
          </p>
          <ol className="list-decimal list-inside text-sm mt-1 ml-2">
            <li>บัตรเครดิต A (ดอกเบี้ย 18%)</li>
            <li>สินเชื่อส่วนบุคคล B (ดอกเบี้ย 12%)</li>
            <li>สินเชื่อรถยนต์ C (ดอกเบี้ย 5%)</li>
          </ol>
        </div>
      )}
    </div>
  );
}
