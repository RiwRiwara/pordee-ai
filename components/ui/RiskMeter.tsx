'use client';
import React from 'react';
import { Button } from '@heroui/button';
import { CircularProgress } from '@heroui/progress';

interface RiskMeterProps {
  riskPercentage: number;
  onPlanClick: () => void;
}

const RiskMeter: React.FC<RiskMeterProps> = ({
  riskPercentage = 0,
  onPlanClick,
}) => {
  // Determine risk label based on percentage
  const getRiskLabel = () => {
    if (riskPercentage === 0) return '(ยังไม่มี)';
    if (riskPercentage < 30) return 'ต่ำ';
    if (riskPercentage < 60) return 'ปานกลาง';
    if (riskPercentage < 80) return 'สูง';
    return 'สูงมาก';
  };



  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-1">ระดับความเสี่ยงของคุณ</h2>
      <p className="text-sm text-gray-500 mb-2">Debt-to-Income Ratio (หนี้ต่อรายได้)</p>

      {/* Semi-circular Risk Meter Gauge */}
      <div className="w-full flex justify-center items-center">
        <div className="justify-center items-center pb-0">

          <CircularProgress
            classNames={{
              svg: 'w-36 h-36 drop-shadow-md',
              indicator: "",
              track: 'stroke-white/10',
              value: 'text-3xl font-semibold text-primary',
            }}
            showValueLabel={true}
            strokeWidth={4}
            value={riskPercentage}
            aria-label={`ระดับความเสี่ยงอยู่ที่ ${riskPercentage} เปอร์เซ็นต์ ระดับ: ${getRiskLabel()}`}
          />
        </div>
      </div>

      {/* Risk Label */}
      <p className="text-center text-lg font-medium mt-2">
        ระดับความเสี่ยง: {getRiskLabel()}
      </p>
      <p className="text-center text-xs text-gray-500 mb-4">
        กรุณาเพิ่มข้อมูลให้ครบถ้วนสมบูรณ์เพื่อคำนวณระดับความเสี่ยง
      </p>

      {/* AI Insight Box */}
      <div className="bg-gray-100 rounded-lg p-3 mb-4 text-md">
        <h3 className="font-normal mb-1">AI Insight</h3>
        <p className="text-sm text-gray-600">
          กรุณาเพิ่มข้อมูลในวันถัดไป เพื่อ AI สามารถให้คำแนะนำคุณได้
        </p>
      </div>

      {/* Action Button */}
      <Button
        color="primary"
        className="w-full bg-blue-500 text-white py-3"
        onPress={onPlanClick}
        aria-label="เริ่มวางแผนจัดการหนี้"
      >
        เริ่มวางแผนจัดการหนี้
      </Button>
    </div>
  );
};

export default RiskMeter;