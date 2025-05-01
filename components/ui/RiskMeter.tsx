"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { CircularProgress } from "@heroui/progress";
import { Spinner } from "@heroui/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import ReactMarkdown from "react-markdown";

import AIService, { createDebtPrompt, type DebtContext } from "@/lib/aiService";

interface RiskMeterProps {
  debtContext?: DebtContext;
  riskPercentage?: number;
  onPlanClick: () => void;
}

// Maximum length for insight preview before showing "Read more..."
const MAX_INSIGHT_PREVIEW_LENGTH = 200;

const RiskMeter: React.FC<RiskMeterProps> = ({
  debtContext,
  riskPercentage: propRiskPercentage,
  onPlanClick,
}) => {
  // Calculate debt-to-income ratio
  const calculatedRatio = useMemo(() => {
    if (!debtContext) return 0;

    // Calculate total minimum debt payments
    const totalMinimumDebt = debtContext.debtItems.reduce((sum, debt) => {
      return sum + parseFloat(debt.minimumPayment || "0");
    }, 0);

    // Get income before expenses and tax
    const income = parseFloat(debtContext.income || "0");

    // Avoid division by zero
    if (income <= 0) return 0;

    // Calculate debt-to-income ratio: (all minimum debt / income) * 100
    return (totalMinimumDebt / income) * 100;
  }, [debtContext]);

  // Use calculated ratio or prop value if available
  const riskPercentage =
    propRiskPercentage !== undefined ? propRiskPercentage : calculatedRatio;

  // Determine risk status based on percentage using the provided rules
  const getRiskStatus = () => {
    if (riskPercentage <= 40)
      return {
        label: "ปลอดภัย",
        color: "text-green-500",
        colorClass: "text-green-500",
        trackColor: "stroke-green-100",
        indicatorColor: "stroke-green-500",
      };
    if (riskPercentage <= 60)
      return {
        label: "เริ่มเสี่ยง",
        color: "text-yellow-500",
        colorClass: "text-yellow-500",
        trackColor: "stroke-yellow-100",
        indicatorColor: "stroke-yellow-500",
      };
    if (riskPercentage <= 80)
      return {
        label: "เสี่ยงสูง",
        color: "text-orange-500",
        colorClass: "text-orange-500",
        trackColor: "stroke-orange-100",
        indicatorColor: "stroke-orange-500",
      };

    return {
      label: "วิกฤติ",
      color: "text-red-500",
      colorClass: "text-red-500",
      trackColor: "stroke-red-100",
      indicatorColor: "stroke-red-500",
    };
  };

  // Get risk description based on percentage
  const getRiskDescription = () => {
    if (riskPercentage <= 40)
      return "อยู่ในระดับดี จัดการหนี้ได้โดยไม่กระทบค่าใช้จ่ายจำเป็น";
    if (riskPercentage <= 60)
      return "เริ่มกระทบกับการออมและสภาพคล่อง แต่ยังพอจัดการได้";
    if (riskPercentage <= 80)
      return "มีภาระหนี้มาก รายได้เริ่มไม่พอใช้หลังชำระหนี้";

    return "อยู่ในภาวะอาจหมุนเงินไม่ทัน และเข้าใกล้หนี้เสีย";
  };

  const riskStatus = getRiskStatus();

  // State for AI-generated insight
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
  const [aiError, setAiError] = useState<boolean>(false);
  const [isFullInsightModalOpen, setIsFullInsightModalOpen] =
    useState<boolean>(false);

  // Get fallback AI insight based on risk level
  const getFallbackInsight = () => {
    if (!debtContext || riskPercentage === 0) {
      return "กรุณาเพิ่มข้อมูลหนี้และรายได้ของคุณ เพื่อให้ AI สามารถวิเคราะห์และให้คำแนะนำได้";
    }

    if (riskPercentage <= 40) {
      return `คุณใช้ ${riskPercentage.toFixed(0)}% ของรายได้ไปกับหนี้ทั้งหมด ซึ่งอยู่ในเกณฑ์ที่ดี คุณสามารถบริหารจัดการหนี้ได้ดี และมีเงินเหลือสำหรับใช้จ่ายและการออม`;
    }

    if (riskPercentage <= 60) {
      return `คุณใช้ ${riskPercentage.toFixed(0)}% ของรายได้ไปกับหนี้ ควรระมัดระวังไม่ก่อหนี้เพิ่ม และวางแผนชำระหนี้ให้เร็วขึ้นเพื่อลดภาระดอกเบี้ย`;
    }

    if (riskPercentage <= 80) {
      return `คุณใช้ ${riskPercentage.toFixed(0)}% ของรายได้ไปกับหนี้ ซึ่งสูงเกินความปลอดภัย ควรเร่งลดค่าใช้จ่ายที่ไม่จำเป็น และหาแนวทางเพิ่มรายได้หรือปรับโครงสร้างหนี้`;
    }

    return `คุณใช้ ${riskPercentage.toFixed(0)}% ของรายได้ไปกับหนี้ทั้งหมด ซึ่งอยู่ในภาวะวิกฤติ ต้องปรึกษาผู้เชี่ยวชาญทางการเงินโดยด่วน เพื่อวางแผนแก้ไขปัญหาอย่างเร่งด่วน`;
  };

  // Generate AI insight using the AIService
  const generateAIInsight = async () => {
    // Skip if there's no debt context or no debt items
    if (
      !debtContext ||
      debtContext.debtItems.length === 0 ||
      parseFloat(debtContext.income) <= 0
    ) {
      setAiInsight(getFallbackInsight());

      return;
    }

    try {
      setIsLoadingInsight(true);
      setAiError(false);

      // Create an instance of AIService
      const aiService = new AIService();

      // Set a financial advisor context
      aiService.setPersonalContext(
        `คุณคือที่ปรึกษาทางการเงินส่วนบุคคลที่เชี่ยวชาญด้านการจัดการหนี้สิน
      - ตอบกลับด้วยภาษาไทยเท่านั้น
      - ใช้ภาษาที่อบอุ่น เป็นกันเอง พูดคุยเหมือนคนใกล้ชิด
      - ไม่ออกคำสั่ง ไม่วิจารณ์ ชวนให้ผู้ใช้สะท้อนคิดถึงพฤติกรรมการใช้เงินของตัวเอง
      - สรุปเป็นหัวข้อแบบ Bullet Point ไม่เกิน 2 ข้อ
      - ไม่ใช้คำสำนวนที่เป็นทางการหรือฟังดูแข็ง เช่น "การวิเคราะห์สถานะทางการเงิน" หรือ "มาเริ่มกันที่..."
      - เขียนให้กระชับ ชัดเจน และช่วยให้ผู้ใช้เข้าใจตัวเองมากขึ้น
      - อธิบายหลักการจัดการหนี้เบื้องต้นด้วยภาษาง่าย ๆ โดยไม่ใส่ตัวเลขหรือเปอร์เซ็นต์ตรง ๆ
      - แนะนำแผนการจัดการหนี้เบื้องต้น
      `,
      );

      // Create a structured prompt from the debt context
      const prompt = createDebtPrompt(debtContext);

      // Generate a response using the API
      const response = await aiService.generateResponse(prompt);

      // Update the state with the AI-generated insight
      setAiInsight(response);
    } catch (error) {
      console.error("Error generating AI insight:", error);
      setAiError(true);
      // Fall back to template-based insight if AI fails
      setAiInsight(getFallbackInsight());
    } finally {
      setIsLoadingInsight(false);
    }
  };

  // Generate AI insight when debt context changes
  useEffect(() => {
    // Only generate AI insights if we have valid debt data
    if (debtContext && debtContext.debtItems.length > 0) {
      generateAIInsight();
    } else {
      setAiInsight(getFallbackInsight());
    }
  }, [debtContext]);

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-1">ระดับความเสี่ยงของคุณ</h2>
      <p className="text-sm text-gray-500 mb-2">
        Debt-to-Income Ratio (หนี้ต่อรายได้)
      </p>

      {/* Semi-circular Risk Meter Gauge */}
      <div className="w-full flex justify-center items-center">
        <div className="justify-center items-center pb-0">
          <CircularProgress
            aria-label={`ระดับความเสี่ยงอยู่ที่ ${riskPercentage.toFixed(0)}% ระดับ: ${riskStatus.label}`}
            classNames={{
              svg: "w-36 h-36 drop-shadow-md",
              indicator: riskStatus.indicatorColor,
              track: riskStatus.trackColor || "stroke-gray-100",
              value: `text-3xl font-semibold ${riskStatus.colorClass}`,
            }}
            showValueLabel={true}
            strokeWidth={4}
            value={riskPercentage}
          />
        </div>
      </div>

      {/* Risk Label */}
      <div className="text-center mt-2">
        <p className={`text-lg font-medium ${riskStatus.colorClass}`}>
          {riskPercentage > 0
            ? `อยู่ในภาวะ${riskStatus.label}`
            : "(ยังไม่มีข้อมูล)"}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          {riskPercentage > 0
            ? getRiskDescription()
            : "กรุณาเพิ่มข้อมูลหนี้และรายได้เพื่อคำนวณระดับความเสี่ยง"}
        </p>
      </div>

      {/* AI Insight Box */}
      <div className="bg-gray-100 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium">AI Insight</h3>
          {isLoadingInsight && <Spinner className="text-blue-500" size="sm" />}
        </div>
        {aiError ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-700">{getFallbackInsight()}</p>
            <Button
              className="self-end text-xs"
              size="sm"
              variant="light"
              onPress={() => generateAIInsight()}
            >
              ลองอีกครั้ง
            </Button>
          </div>
        ) : (
          <div className="text-sm text-gray-700">
            {isLoadingInsight ? (
              <p className="text-gray-500">
                กำลังวิเคราะห์ข้อมูลทางการเงินของคุณ...
              </p>
            ) : (
              <div className="insight-content prose prose-sm max-w-none">
                {aiInsight && aiInsight.length > 0 ? (
                  <>
                    <ReactMarkdown>
                      {aiInsight.length > MAX_INSIGHT_PREVIEW_LENGTH
                        ? `${aiInsight.substring(0, MAX_INSIGHT_PREVIEW_LENGTH)}...`
                        : aiInsight}
                    </ReactMarkdown>

                    {aiInsight.length > MAX_INSIGHT_PREVIEW_LENGTH && (
                      <Button
                        className="mt-1 text-blue-500 text-xs"
                        size="sm"
                        variant="light"
                        onPress={() => setIsFullInsightModalOpen(true)}
                      >
                        อ่านเพิ่มเติม...
                      </Button>
                    )}
                  </>
                ) : (
                  <p>{getFallbackInsight()}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Full Insight Modal */}
        <Modal
          isOpen={isFullInsightModalOpen}
          scrollBehavior="inside"
          onOpenChange={(isOpen) => setIsFullInsightModalOpen(isOpen)}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-lg font-semibold">คำแนะนำทางการเงิน</h2>
            </ModalHeader>
            <ModalBody>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{aiInsight}</ReactMarkdown>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onPress={() => setIsFullInsightModalOpen(false)}>
                ปิด
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      {/* Action Button */}
      <Button
        aria-label="เริ่มวางแผนจัดการหนี้"
        className="w-full py-3"
        color="primary"
        onPress={() => {}}
      >
        เริ่มวางแผนจัดการหนี้
      </Button>
    </div>
  );
};

export default RiskMeter;
