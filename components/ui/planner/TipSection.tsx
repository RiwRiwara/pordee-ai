import React, { useState, useEffect } from "react";
import { FiInfo, FiRefreshCw } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { Spinner } from "@heroui/spinner";

import AIService, { DebtContext, createDebtPrompt } from "@/lib/aiService";

interface Tip {
  id: number;
  title: string;
  description: string;
  isAI?: boolean;
}

interface TipSectionProps {
  debtContext?: DebtContext;
  riskPercentage?: number;
}

export default function TipSection({
  debtContext,
  riskPercentage = 0,
}: TipSectionProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [aiTip, setAiTip] = useState<string>("");
  // Combine static tips with AI-generated tip
  const staticTips: Tip[] = [
    {
      id: 1,
      title: "Pordee Tips",
      description:
        "ถ้าเดือนนี้ โปะเพิ่มอีก 1,000 บาท คุณจะลดดอกเบี้ยรวมได้อีก 250 บาท เลยนะ!",
    },
    {
      id: 2,
      title: "Pordee Tips",
      description:
        "การชำระเงินเกินขั้นต่ำ 20% ช่วยลดระยะเวลาการชำระหนี้ได้ถึง 30%",
    },
    {
      id: 3,
      title: "Pordee Tips",
      description:
        "หากคุณมีหนี้หลายก้อน ให้จ่ายหนี้ที่มีดอกเบี้ยสูงสุดก่อนเสมอ",
    },
  ];

  // Combine static tips with AI tip if available
  const tips: Tip[] = aiTip
    ? [
        ...staticTips,
        {
          id: staticTips.length + 1,
          title: "AI แนะนำสำหรับคุณ",
          description: aiTip,
          isAI: true,
        },
      ]
    : staticTips;

  // State for current tip index
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Generate AI tip when debt context changes
  useEffect(() => {
    if (
      debtContext &&
      debtContext.debtItems &&
      debtContext.debtItems.length > 0
    ) {
      generateAITip();
    }
  }, [debtContext]);

  // Auto cycle through tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [tips.length]);

  // Function to generate AI tip
  const generateAITip = async () => {
    if (
      !debtContext ||
      !debtContext.debtItems ||
      debtContext.debtItems.length === 0
    )
      return;

    try {
      setIsLoading(true);

      // Create AI service instance
      const aiService = new AIService();

      // Set personal context for financial advisor
      aiService.setPersonalContext(
        `คุณคือที่ปรึกษาทางการเงินส่วนบุคคลที่เชี่ยวชาญด้านการจัดการหนี้สิน
        - ตอบกลับด้วยภาษาไทยเท่านั้น
        - ใช้ภาษาที่อบอุ่น เป็นกันเอง พูดคุยเหมือนคนใกล้ชิด
        - ให้คำแนะนำสั้นๆ ไม่เกิน 1 ประโยค ที่เป็นประโยชน์และปฏิบัติได้จริง
        - ไม่ใช้คำศัพท์ทางการเงินที่ซับซ้อน
        - ไม่พูดถึงตัวเลขเฉพาะเจาะจง เช่น จำนวนเงิน หรือเปอร์เซ็นต์
        - เน้นให้กำลังใจและแนะนำเทคนิคการจัดการหนี้ที่ทำได้จริง`,
      );

      // Determine risk level based on DTI percentage
      let riskLevel = "ปลอดภัย";

      if (riskPercentage > 80) {
        riskLevel = "วิกฤติ";
      } else if (riskPercentage > 60) {
        riskLevel = "เสี่ยงสูง";
      } else if (riskPercentage > 40) {
        riskLevel = "เริ่มเสี่ยง";
      }

      // Create debt context with risk percentage and risk level
      const contextWithRisk = {
        ...debtContext,
        riskPercentage: riskPercentage,
        riskLevel: riskLevel,
      };

      // Generate prompt from debt context
      const prompt = createDebtPrompt(contextWithRisk);

      // Add specific instruction for tip generation based on risk level
      let tipPrompt = `${prompt}\n\nกรุณาให้เคล็ดลับการจัดการหนี้สั้นๆ 1 ประโยค ที่เหมาะกับสถานการณ์ของฉัน`;

      // Add risk level specific guidance
      if (riskPercentage > 60) {
        tipPrompt += " โดยเน้นการลดความเสี่ยงและจัดการภาระหนี้ที่สูง";
      } else if (riskPercentage > 40) {
        tipPrompt += " โดยเน้นการวางแผนและปรับพฤติกรรมทางการเงิน";
      } else {
        tipPrompt += " โดยเน้นการรักษาวินัยทางการเงินและการออม";
      }

      // Get AI response
      const response = await aiService.generateResponse(tipPrompt);

      // Clean up response (remove quotes, bullet points, etc.)
      const cleanedResponse = response
        .replace(/^[\"'-\s]+|[\"'-\s]+$/g, "") // Remove quotes and dashes
        .replace(/^\s*[-•*]\s*/gm, "") // Remove bullet points
        .replace(/\n+/g, " ") // Replace newlines with spaces
        .trim();

      setAiTip(cleanedResponse);
    } catch (error) {
      console.error("Error generating AI tip:", error);
      // Set a fallback tip based on risk level if AI generation fails
      if (riskPercentage > 60) {
        setAiTip(
          "การจัดลำดับความสำคัญของหนี้และการเจรจากับเจ้าหนี้สามารถช่วยลดความเสี่ยงทางการเงินของคุณได้",
        );
      } else if (riskPercentage > 40) {
        setAiTip(
          "การสร้างแผนชำระหนี้ที่ชัดเจนและติดตามค่าใช้จ่ายอย่างใกล้ชิดจะช่วยให้คุณจัดการหนี้ได้ดีขึ้น",
        );
      } else {
        setAiTip(
          "การรักษาวินัยทางการเงินและการออมอย่างสม่ำเสมอจะช่วยให้คุณมีความมั่นคงทางการเงินในระยะยาว",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentTip = tips[currentTipIndex];

  // Get risk color based on risk percentage
  const getRiskColor = () => {
    if (riskPercentage <= 40) return "text-green-500";
    if (riskPercentage <= 60) return "text-yellow-500";
    if (riskPercentage <= 80) return "text-orange-500";

    return "text-red-500";
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Risk indicator if available */}
        {riskPercentage > 0 && (
          <div
            className="absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded-bl-lg"
            style={{ backgroundColor: "rgba(243, 244, 246, 0.8)" }}
          >
            <span className={`${getRiskColor()}`}>DTI: {riskPercentage}%</span>
          </div>
        )}

        {/* Light bulb icon with blue background */}
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            {currentTip.isAI ? (
              <div className="relative">
                {isLoading ? (
                  <Spinner color="primary" size="sm" />
                ) : (
                  <span className="text-blue-600 text-xs font-bold">AI</span>
                )}
              </div>
            ) : (
              <FiInfo className="text-blue-600" size={20} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">{currentTip.title}</h3>
              {currentTip.isAI && (
                <button
                  aria-label="Refresh AI tip"
                  className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                  disabled={isLoading}
                  onClick={generateAITip}
                >
                  <FiRefreshCw
                    className={isLoading ? "animate-spin" : ""}
                    size={16}
                  />
                </button>
              )}
            </div>
            <p className="text-gray-700 text-sm">{currentTip.description}</p>
          </div>
        </div>

        {/* Tip navigation dots */}
        <div className="flex justify-center mt-3">
          {tips.map((_, index) => (
            <button
              key={index}
              aria-label={`Tip ${index + 1}`}
              className={`w-2 h-2 mx-1 rounded-full ${index === currentTipIndex ? "bg-blue-500" : "bg-gray-300"}`}
              onClick={() => setCurrentTipIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
