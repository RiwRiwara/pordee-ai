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
import { Radio, RadioGroup } from "@heroui/radio";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";

import DebtPlanModal from "./debt_plan/DebtPlanModal";
import { useCustomToast } from "./ToastNotification";
import { useTracking } from "@/lib/tracking";

import AIService, {
  createDebtPrompt,
  type DebtContext as AIDebtContext,
} from "@/lib/aiService";
import {
  calculateDTI,
  getDTIRiskStatus,
  saveDTIRiskAssessment,
  type DebtContext,
} from "@/lib/dtiService";

interface RiskMeterProps {
  debtContext?: DebtContext;
  riskPercentage?: number;
  onPlanClick: () => void;
}

// Extended debt item interface to match what's used in the component
interface ExtendedDebtItem {
  id?: string;
  _id: string;
  name: string;
  debtType: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  paymentDueDay?: number;
  dueDate?: string | number;
}

// Maximum length for insight preview before showing "Read more..."
const MAX_INSIGHT_PREVIEW_LENGTH = 200;

const RiskMeter: React.FC<RiskMeterProps> = ({
  debtContext,
  riskPercentage: propRiskPercentage,
  onPlanClick,
}) => {
  const { data: session } = useSession();

  // Calculate debt-to-income ratio using shared service
  const calculatedRatio = useMemo(() => {
    return calculateDTI(debtContext);
  }, [debtContext]);

  // Use calculated ratio or prop value if available
  const riskPercentage =
    propRiskPercentage !== undefined ? propRiskPercentage : calculatedRatio;

  // Save DTI to database when it changes
  useEffect(() => {
    if (session?.user?.id && riskPercentage > 0) {
      saveDTIRiskAssessment(session.user.id, riskPercentage);
    }
  }, [session?.user?.id, riskPercentage]);

  // Get risk status from shared service
  const getRiskStatus = () => {
    const status = getDTIRiskStatus(riskPercentage);

    return {
      label: status.label,
      color: status.color,
      bgColor: status.bgColor,
      colorClass: status.colorClass,
      trackColor: status.trackColor,
      indicatorColor: status.indicatorColor,
      description: status.description,
    };
  };

  // Get risk description from shared service
  const getRiskDescription = () => {
    return getRiskStatus().description;
  };

  const riskStatus = getRiskStatus();

  // State for AI-generated insight
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
  const [aiError, setAiError] = useState<boolean>(false);
  const [isFullInsightModalOpen, setIsFullInsightModalOpen] =
    useState<boolean>(false);
  const [isDebtPlanModalOpen, setIsDebtPlanModalOpen] =
    useState<boolean>(false);
  const [isPlanSelectionModalOpen, setIsPlanSelectionModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<"quick" | "save" | "balanced" | null>(null);
  const { showNotification } = useCustomToast();
  const { trackEdit, trackPlannerStart } = useTracking();

  // Get fallback AI insight based on risk level
  const getFallbackInsight = () => {
    if (!debtContext || riskPercentage === 0) {
      return "กรุณาเพิ่มข้อมูลหนี้และรายได้ของคุณ เพื่อให้ AI สามารถวิเคราะห์และให้คำแนะนำได้";
    }

    if (riskPercentage <= 40) {
      return `คุณใช้ ${riskPercentage.toFixed(2)}% ของรายได้ไปกับหนี้ทั้งหมด ซึ่งอยู่ในเกณฑ์ที่ดี คุณสามารถบริหารจัดการหนี้ได้ดี และมีเงินเหลือสำหรับใช้จ่ายและการออม`;
    }

    if (riskPercentage <= 60) {
      return `คุณใช้ ${riskPercentage.toFixed(2)}% ของรายได้ไปกับหนี้ ควรระมัดระวังไม่ก่อหนี้เพิ่ม และวางแผนชำระหนี้ให้เร็วขึ้นเพื่อลดภาระดอกเบี้ย`;
    }

    if (riskPercentage <= 80) {
      return `คุณใช้ ${riskPercentage.toFixed(2)}% ของรายได้ไปกับหนี้ ซึ่งอยู่ในระดับที่สูง ควรเร่งลดภาระหนี้ลง และอาจต้องปรับลดค่าใช้จ่ายที่ไม่จำเป็น`;
    }

    return `คุณใช้ ${riskPercentage.toFixed(2)}% ของรายได้ไปกับหนี้ ซึ่งอยู่ในระดับวิกฤติ ควรเร่งปรับโครงสร้างหนี้ หรือปรึกษาผู้เชี่ยวชาญเพื่อวางแผนแก้ไขสถานการณ์โดยเร็ว`;
  };

  // Generate AI insight using the AIService
  const generateAIInsight = async () => {
    // Skip if there's no debt context or no debt items
    if (
      !debtContext ||
      debtContext.debtItems.length === 0 ||
      !debtContext.income ||
      parseFloat(debtContext.income.toString()) <= 0
    ) {
      setAiInsight(getFallbackInsight());

      return;
    }

    try {
      setIsLoadingInsight(true);
      setAiError(false);

      if (!debtContext) return;

      // Create AI-compatible debt context
      const aiDebtContext: AIDebtContext = {
        debtItems: debtContext.debtItems.map((item) => ({
          id: item._id || "",
          name: item.name,
          debtType: item.debtType,
          totalAmount: item.totalAmount.toString(),
          minimumPayment: (item.minimumPayment || 0).toString(),
          interestRate: (item.interestRate || 0).toString(),
          dueDate: (item.paymentDueDay || 1).toString(),
          paymentStatus: "pending",
        })),
        income: debtContext.income.toString(),
        expense: "0", // Required by AIDebtContext but not in our DebtContext
        riskPercentage: riskPercentage,
      };

      // Create prompt for AI
      const prompt = createDebtPrompt(aiDebtContext);

      // Create an instance of AIService
      const aiService = new AIService();

      // Set personal context for financial advisor
      aiService.setPersonalContext(
        `คุณคือที่ปรึกษาทางการเงินส่วนบุคคลที่เชี่ยวชาญด้านการจัดการหนี้สิน
        - ตอบกลับด้วยภาษาไทยเท่านั้น
        - ใช้ภาษาที่เป็นมืออาชีพแต่เข้าใจง่าย
        - ให้คำแนะนำที่ปฏิบัติได้จริงและเฉพาะเจาะจงกับสถานการณ์หนี้ของผู้ใช้
        - อธิบายแผนการจัดการหนี้ที่เหมาะสมกับระดับความเสี่ยงของผู้ใช้
        - แนะนำวิธีลดความเสี่ยงทางการเงินและเพิ่มความมั่นคง`,
      );

      // Call AI service using generateResponse method
      const response = await aiService.generateResponse(prompt);

      if (response) {
        setAiInsight(response);
      } else {
        throw new Error("No content in AI response");
      }
    } catch (error) {
      console.error("Error generating AI insight:", error);
      setAiError(true);
      setAiInsight(""); // Clear any partial insights
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const getTrackColor = (riskPercentage: number) => {
    if (riskPercentage <= 40) {
      return "stroke-green-500";
    } else if (riskPercentage <= 60) {
      return "stroke-yellow-500";
    } else if (riskPercentage <= 80) {
      return "stroke-orange-500";
    } else {
      return "stroke-red-500";
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

  const renderRiskMeter = () => {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <CircularProgress
            aria-label="Risk Meter"
            classNames={{
              svg: "w-36 h-36 drop-shadow-md",
              indicator: riskStatus.indicatorColor,
              track: getTrackColor(riskPercentage),
              value: `text-xl font-semibold ${riskStatus.colorClass}`,
            }}
            showValueLabel={true}
            size="lg"
            strokeWidth={4}
            value={riskPercentage}
            valueLabel={`${riskPercentage.toFixed(2)}%`}
          />
        </div>
        <div className="mt-2 text-center">
          <p className={`font-semibold ${riskStatus.colorClass}`}>
            {riskStatus.label}
          </p>
        </div>
      </div>
    );
  };

  // Plan types
  type PlanType = "quick" | "save" | "balanced" | null;

  interface Plan {
    id: PlanType;
    title: string;
    description: string;
  }

  const plans: Plan[] = [
    {
      id: "quick",
      title: "เห็นผลเร็ว",
      description: "เลือกจ่ายหนี้ก้อนเล็กก่อน เพื่อปลดหนี้ก้อนแรกได้ไว",
    },
    {
      id: "save",
      title: "คุ้มที่สุด",
      description: "โฟกัสหนี้ดอกเบี้ยสูง ลดต้นทุนได้มากที่สุดเฉพาะบุคคล",
    },
    {
      id: "balanced",
      title: "แผนสมดุล",
      description:
        "ผสมผสานวิธีการชำระหนี้ เพื่อสมดุลระหว่างความเร็วและความคุ้มค่า",
    },
  ];

  const handleSavePlan = () => {
    // Show success notification
    showNotification(
      "เลือกแผนสำเร็จ",
      "แผนการชำระหนี้ของคุณถูกบันทึกแล้ว",
      "solid",
      "success"
    );
    
    // Track edit when user saves a plan
    trackEdit();
    
    // Close plan selection modal and open debt plan modal
    setIsPlanSelectionModalOpen(false);
    setIsDebtPlanModalOpen(true);
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-1">ระดับความเสี่ยงของคุณ</h2>
      <p className="text-sm text-gray-500 mb-2">
        Debt-to-Income Ratio (หนี้ต่อรายได้)
      </p>

      <div>
        {/* Semi-circular Risk Meter Gauge */}
        <div className="w-full flex justify-center items-center">
          <div className="justify-center items-center pb-0">
            {renderRiskMeter()}
          </div>
        </div>
      </div>

      <div className="text-center mt-2">
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
        onPress={() => setIsPlanSelectionModalOpen(true)}
      >
        เริ่มวางแผนจัดการหนี้
      </Button>

      {/* Plan Selection Modal */}
      <Modal
        aria-label="เลือกเป้าหมายของคุณ"
        classNames={{
          backdrop: "bg-[rgba(0,0,0,0.5)]",
          base: "mx-auto",
        }}
        isOpen={isPlanSelectionModalOpen}
        placement="center"
        size="md"
        onClose={() => setIsPlanSelectionModalOpen(false)}
      >
        <ModalContent className="max-h-[80vh] rounded-lg overflow-hidden">
          <ModalHeader className="border-b border-gray-200 px-5 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">เลือกเป้าหมายของคุณ</h2>
            </div>
          </ModalHeader>

          <div className="px-5 py-4 overflow-y-auto">
            <RadioGroup
              className="space-y-4"
              value={selectedPlan !== null ? selectedPlan : ""}
              onValueChange={(value) => {
                // Track edit when user selects a plan
                trackEdit();

                // Handle value as appropriate PlanType
                if (value === "") {
                  setSelectedPlan(null);
                } else {
                  setSelectedPlan(value as "quick" | "save" | "balanced");
                }
              }}
            >
              {plans.map((plan) => (
                <Radio
                  key={plan.id}
                  className="p-4 border rounded-xl hover:border-primary-200 transition-colors"
                  classNames={{
                    base: "max-w-full",
                    label: "font-medium",
                    description: "text-gray-600 text-sm mt-1",
                  }}
                  description={plan.description}
                  value={(plan.id as PlanType) || "quick"}
                >
                  {plan.title}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <div className="px-5 py-4 border-t border-gray-200 flex justify-end space-x-3 mt-2">
            <Button
              className="px-4"
              color="default"
              variant="light"
              onPress={() => setIsPlanSelectionModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              className="px-5 font-medium shadow-sm"
              color="primary"
              onPress={handleSavePlan}
            >
              บันทึก
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* Debt Plan Modal */}
      <DebtPlanModal
        debtContext={
          debtContext?.debtItems.map((debt) => ({
            _id: (debt as any)._id || "",
            name: debt.name,
            debtType: debt.debtType,
            totalAmount:
              typeof debt.totalAmount === "string"
                ? parseFloat(debt.totalAmount)
                : debt.totalAmount,
            remainingAmount:
              typeof debt.remainingAmount === "string"
                ? parseFloat(debt.remainingAmount)
                : debt.remainingAmount,
            interestRate:
              typeof debt.interestRate === "string"
                ? parseFloat(debt.interestRate)
                : debt.interestRate,
            minimumPayment:
              typeof debt.minimumPayment === "string"
                ? parseFloat(debt.minimumPayment)
                : debt.minimumPayment || 0,
            paymentDueDay: (debt as ExtendedDebtItem).dueDate
              ? parseInt(((debt as ExtendedDebtItem).dueDate || 0).toString())
              : undefined,
          })) || [] /* Pass as array, not object */
        }
        goalType={selectedPlan || "เห็นผลเร็ว"}
        isOpen={isDebtPlanModalOpen}
        monthlyPayment={
          debtContext?.debtItems.reduce((sum, debt) => {
            const minimumPayment =
              typeof debt.minimumPayment === "string"
                ? parseFloat(debt.minimumPayment)
                : debt.minimumPayment || 0;

            return sum + minimumPayment;
          }, 0) || 0
        }
        paymentStrategy="Snowball"
        riskPercentage={riskPercentage}
        timeInMonths={30}
        onOpenChange={setIsDebtPlanModalOpen}
        onSavePlan={(plan) => {
          // Handle the plan update here
          console.log("Plan updated:", plan);
          onPlanClick?.();
        }}
      />
    </div>
  );
};

export default RiskMeter;
