import React from "react";

interface RiskIndicatorProps {
  riskPercentage: number;
}

export default function RiskIndicator({ riskPercentage }: RiskIndicatorProps) {
  // Get risk status text and color based on percentage
  const getRiskStatus = () => {
    // Less than or equal to 30%: Safe (Green)
    if (riskPercentage <= 30) {
      return {
        status: "ปลอดภัย",
        color: "bg-green-500",
        textColor: "text-green-700",
        description:
          "สถานะทางการเงินของคุณอยู่ในเกณฑ์ที่ดี สามารถจัดการหนี้สินได้อย่างมีประสิทธิภาพ",
      };
    }
    // 31%-49%: Moderate Risk (Yellow)
    else if (riskPercentage <= 49) {
      return {
        status: "ความเสี่ยงปานกลาง",
        color: "bg-yellow-500",
        textColor: "text-yellow-700",
        description:
          "ควรเฝ้าระวังและควบคุมการก่อหนี้เพิ่มเติม เพื่อไม่ให้กระทบกับการใช้จ่ายประจำวัน",
      };
    }
    // 50%-69%: High Risk (Orange)
    else if (riskPercentage <= 69) {
      return {
        status: "ความเสี่ยงสูง",
        color: "bg-orange-500",
        textColor: "text-orange-700",
        description:
          "มีภาระหนี้สินในระดับที่ค่อนข้างสูง ควรวางแผนการชำระหนี้อย่างเคร่งครัดและหลีกเลี่ยงการก่อหนี้เพิ่ม",
      };
    }
    // 70%-89%: Very High Risk (Red)
    else if (riskPercentage <= 89) {
      return {
        status: "ความเสี่ยงสูงมาก",
        color: "bg-red-500",
        textColor: "text-red-700",
        description:
          "ภาระหนี้สินอยู่ในระดับที่อันตราย ควรปรึกษาผู้เชี่ยวชาญและเร่งปรับปรุงแผนการชำระหนี้โดยเร็ว",
      };
    }
    // 90% and above: Critical (Dark Red)
    else {
      return {
        status: "วิกฤต",
        color: "bg-red-700",
        textColor: "text-red-800",
        description:
          "สถานะทางการเงินอยู่ในภาวะวิกฤต ควรเข้ารับคำปรึกษาจากผู้เชี่ยวชาญทางการเงินโดยด่วน",
      };
    }
  };

  const riskStatus = getRiskStatus();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <h3 className="font-medium mb-2">สถานะความเสี่ยงทางการเงิน</h3>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${riskStatus.color} h-2.5 rounded-full`}
          style={{ width: `${Math.min(riskPercentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-500">0%</span>
        <span className="text-xs text-gray-500">50%</span>
        <span className="text-xs text-gray-500">100%</span>
      </div>
      <div className="mt-3">
        <div className="flex items-center">
          <div className={`rounded-full w-3 h-3 ${riskStatus.color} mr-2`} />
          <span className={`font-medium ${riskStatus.textColor}`}>
            {riskStatus.status} ({riskPercentage}%)
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{riskStatus.description}</p>
      </div>
    </div>
  );
}
