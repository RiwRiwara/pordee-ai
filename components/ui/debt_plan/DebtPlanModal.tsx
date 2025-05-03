"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { FiX, FiChevronUp, FiChevronDown } from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// Import components
import { DebtItem } from "../types";
import type { DebtPlan, DebtPlanModalProps } from "./types";
import { DEBT_TYPES, formatNumber } from "./utils/debtPlanUtils";

// Import new partials
import PlanTopSummarySection from "./partials/PlanTopSummarySection";
import AiAdvisorSection from "./partials/AiAdvisorSection";
import MainTabs from "./partials/MainTabs";
import CalulatePlanSection from "./partials/CalulatePlanSection";
import AdjustPlanScrollRange from "./partials/AdjustPlanScrollRange";
import OverallDebtSection from "./partials/OverallDebtSection";

export default function DebtPlanModalRefactored({
  isOpen,
  onOpenChange,
  debtContext,
  riskPercentage = 87,
  goalType: initialGoalType = "เห็นผลเร็ว",
  paymentStrategy: initialPaymentStrategy = "Snowball",
  monthlyPayment: initialMonthlyPayment = 0,
  timeInMonths: initialTimeInMonths = 24,
  existingPlanId,
  onSavePlan,
}: DebtPlanModalProps) {
  // Ref for modal content
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Plan data state
  const [goalType, setGoalType] = useState<string>(initialGoalType);
  const [paymentStrategy, setPaymentStrategy] = useState<string>(
    initialPaymentStrategy,
  );
  const [monthlyPayment, setMonthlyPayment] = useState<number>(
    initialMonthlyPayment,
  );
  const [timeInMonths, setTimeInMonths] = useState<number>(initialTimeInMonths);
  const [goalSliderValue, setGoalSliderValue] = useState<number>(50); // 0-100 scale
  const [sliderValue, setSliderValue] = useState<number>(
    initialMonthlyPayment || 1000,
  );

  // Comparison plan data
  const [originalMonthlyPayment, setOriginalMonthlyPayment] =
    useState<number>(0);
  const [originalTimeInMonths, setOriginalTimeInMonths] = useState<number>(24);
  const [reducedTimeInMonths, setReducedTimeInMonths] = useState<number>(20);
  const [reducedMonthlyPayment, setReducedMonthlyPayment] = useState<number>(0);
  const [acceleratedTimeInMonths, setAcceleratedTimeInMonths] =
    useState<number>(4);
  const [acceleratedMonthlyPayment, setAcceleratedMonthlyPayment] =
    useState<number>(0);

  // UI state
  const [activeTab, setActiveTab] = useState<string>("ยอดหนี้รวม");
  const [showComparisonDetails, setShowComparisonDetails] =
    useState<boolean>(false);
  const [currentDebtTypeIndex, setCurrentDebtTypeIndex] = useState<number>(0);
  const [showAIRecommendation, setShowAIRecommendation] =
    useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");

  // Format numbers with commas
  const formatNumberLocal = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Calculate total debt and minimum payments
  useEffect(() => {
    if (debtContext?.length > 0) {
      const totalDebt = debtContext.reduce(
        (sum: number, debt: DebtItem) => sum + debt.remainingAmount,
        0,
      );

      const minPayment = debtContext.reduce(
        (sum: number, debt: DebtItem) => sum + (debt.minimumPayment || 0),
        0,
      );

      // Set initial monthly payment to minimum payment
      setMonthlyPayment(minPayment);
      setOriginalMonthlyPayment(minPayment);
      setSliderValue(minPayment);

      // Calculate reduced payment (slightly less than original)
      setReducedMonthlyPayment(Math.round(minPayment * 0.7));

      // Calculate accelerated payment (more than original)
      setAcceleratedMonthlyPayment(Math.round(minPayment * 2.5));

      // Calculate time to pay off debt with current payment
      if (minPayment > 0) {
        const avgInterestRate =
          debtContext.reduce(
            (sum: number, debt: DebtItem) => sum + debt.interestRate,
            0,
          ) / debtContext.length;

        // Simple calculation (in real app would be more complex)
        const months = Math.ceil(totalDebt / minPayment);

        setTimeInMonths(months);
        setOriginalTimeInMonths(months);

        // Calculate reduced time (faster payoff)
        setReducedTimeInMonths(Math.ceil(months * 0.8));

        // Calculate accelerated time (much faster payoff)
        setAcceleratedTimeInMonths(Math.ceil(months * 0.2));
      }
    }
  }, [debtContext]);

  // Handle slider change for payment amount
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    setSliderValue(value);
    setMonthlyPayment(value);

    // Recalculate months based on new payment
    if (debtContext) {
      const totalDebt = debtContext.reduce(
        (sum: number, debt: DebtItem) => sum + debt.remainingAmount,
        0,
      );

      if (value > 0) {
        setTimeInMonths(Math.ceil(totalDebt / value));
      }
    }
  };

  // Handle slider change for goal balance (speed vs interest savings)
  const handleGoalSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    setGoalSliderValue(value);

    // Update goal type based on slider position
    if (value < 33) {
      setGoalType("เห็นผลเร็ว");
      setPaymentStrategy("Snowball");
    } else if (value < 66) {
      setGoalType("สมดุล");
      setPaymentStrategy("Proportional");
    } else {
      setGoalType("ประหยัดดอกเบี้ย");
      setPaymentStrategy("Avalanche");
    }
  };

  // Update payment strategy based on goal slider
  useEffect(() => {
    if (goalSliderValue < 40) {
      setPaymentStrategy("Snowball");
      setGoalType("เห็นผลเร็ว");
    } else if (goalSliderValue > 60) {
      setPaymentStrategy("Avalanche");
      setGoalType("ประหยัดดอกเบี้ย");
    } else {
      // Balanced approach
      setPaymentStrategy("Snowball");
      setGoalType("สมดุล");
    }
  }, [goalSliderValue]);

  // Generate chart data
  const generateChartData = (debtTypeId: string) => {
    const months = Array.from({ length: 24 }, (_, i) => i + 1);

    // Original plan data - higher values that decrease more slowly
    const originalPlanData = months.map((month) => {
      const remainingDebt = 80000 * Math.pow(0.95, month);

      return Math.max(0, Math.round(remainingDebt));
    });

    // New plan data - decreases faster
    const newPlanData = months.map((month) => {
      const remainingDebt = 70000 * Math.pow(0.85, month);

      return Math.max(0, Math.round(remainingDebt));
    });

    return {
      labels: months,
      datasets: [
        {
          label: "แผนเดิม",
          data: originalPlanData,
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: "แผนใหม่",
          data: newPlanData,
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
          borderWidth: 2,
          borderDash: [5, 5],
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "ยอดหนี้ (บาท)",
        },
        ticks: {
          callback: function (this: any, value: string | number) {
            return typeof value === "number"
              ? value.toLocaleString("th-TH")
              : value;
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "เดือน",
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;

            return `${label}: ${value.toLocaleString("th-TH")} บาท`;
          },
        },
      },
    },
  };

  // Get current debt type
  const currentDebtType = DEBT_TYPES[currentDebtTypeIndex];

  // Handle debt type navigation
  const goToNextDebtType = () => {
    setCurrentDebtTypeIndex((prev) =>
      prev === DEBT_TYPES.length - 1 ? 0 : prev + 1,
    );
  };

  const goToPrevDebtType = () => {
    setCurrentDebtTypeIndex((prev) =>
      prev === 0 ? DEBT_TYPES.length - 1 : prev - 1,
    );
  };

  // Determine risk status based on percentage using the provided rules
  const getRiskStatus = () => {
    if (riskPercentage <= 40)
      return {
        label: "ปลอดภัย",
        color: "text-green-500",
        bgColor: "bg-green-500",
        description: "อยู่ในระดับดี จัดการหนี้ได้โดยไม่กระทบค่าใช้จ่ายจำเป็น",
      };
    if (riskPercentage <= 60)
      return {
        label: "เริ่มเสี่ยง",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500",
        description: "เริ่มกระทบกับการออมและสภาพคล่อง แต่ยังพอจัดการได้",
      };
    if (riskPercentage <= 80)
      return {
        label: "เสี่ยงสูง",
        color: "text-orange-500",
        bgColor: "bg-orange-500",
        description: "มีภาระหนี้มาก รายได้เริ่มไม่พอใช้หลังชำระหนี้",
      };

    return {
      label: "วิกฤติ",
      color: "text-red-500",
      bgColor: "bg-red-500",
      description: "อยู่ในภาวะอาจหมุนเงินไม่ทัน และเข้าใกล้หนี้เสีย",
    };
  };

  // Display the risk status indicator
  const getRiskStatusDisplay = () => {
    const status = getRiskStatus();

    return (
      <div className={`${status.bgColor} text-white px-4 py-2 rounded-lg`}>
        <p className="text-xs">DTI</p>
        <p className="text-2xl font-bold">{riskPercentage.toFixed(2)}%</p>
        <p className="text-xs">({status.label})</p>
      </div>
    );
  };

  // Reset plan to default values
  const handleResetPlan = () => {
    // Reset payment strategy and goal type to defaults
    setPaymentStrategy(initialPaymentStrategy);
    setGoalType(initialGoalType);
    
    // Reset payment values
    setMonthlyPayment(originalMonthlyPayment);
    setSliderValue(originalMonthlyPayment);
    
    // Reset goal slider to middle (balanced)
    setGoalSliderValue(50);
    
    // Reset time values
    setTimeInMonths(originalTimeInMonths);
    
    // Reset reduced and accelerated time calculations
    setReducedTimeInMonths(Math.round(originalTimeInMonths * 0.8)); // 20% reduction as default
    setAcceleratedTimeInMonths(Math.round(originalTimeInMonths * 0.2)); // 20% acceleration as default
    
    // Show a notification or feedback
    alert('แผนการชำระหนี้ถูกรีเซ็ตเป็นค่าเริ่มต้น');
  };

  // Handle save plan
  const handleSavePlan = async () => {
    if (!onSavePlan) return;

    try {
      setIsSaving(true);
      setSaveError("");

      // Create plan object with all necessary data
      const plan = {
        id: existingPlanId,
        goalType,
        paymentStrategy,
        monthlyPayment,
        timeInMonths,
        customSettings: {
          goalBalance: goalSliderValue,
        },
      };

      // Call the parent component's save function
      await onSavePlan(plan as unknown as DebtPlan);

      // Close the modal after saving
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      setSaveError("เกิดข้อผิดพลาดในการบันทึกแผน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  // Update payment strategy and recalculate when tab changes
  const handleTabChange = (tabKey: React.Key) => {
    setActiveTab(tabKey as string);
    const newIndex = DEBT_TYPES.findIndex((type) => type.label === tabKey);

    if (newIndex !== -1) {
      setCurrentDebtTypeIndex(newIndex);
    }
  };

  // Fetch existing plan data if available
  useEffect(() => {
    if (existingPlanId) {
      const fetchExistingPlan = async () => {
        try {
          const response = await fetch(`/api/debtPlans/${existingPlanId}`);

          if (response.ok) {
            const plan: DebtPlan = await response.json();

            // Update state with existing plan data
            setGoalType(plan.goalType || initialGoalType);
            setPaymentStrategy(plan.paymentStrategy || initialPaymentStrategy);
            setMonthlyPayment(plan.monthlyPayment || initialMonthlyPayment);
            setTimeInMonths(plan.timeInMonths || initialTimeInMonths);

            // Set slider values
            setSliderValue(plan.monthlyPayment || initialMonthlyPayment);
            setGoalSliderValue(plan.customSettings?.goalBalance || 50);
          }
        } catch (error) {
          console.error("Error fetching debt plan:", error);
        }
      };

      fetchExistingPlan();
    }
  }, [
    existingPlanId,
    initialGoalType,
    initialMonthlyPayment,
    initialPaymentStrategy,
    initialTimeInMonths,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="lg"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between border-b pb-2 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">รายละเอียดแผนการชำระหนี้</h2>
          <button
            aria-label="ปิด"
            className="text-gray-500 hover:text-gray-700 z-20"
            onClick={() => onOpenChange(false)}
          >
            <FiX size={24} />
          </button>
        </ModalHeader>

        <ModalBody className="p-0">
          <div className="p-4 bg-white">
            {/* DTI Risk Indicator */}
            <PlanTopSummarySection
              goalType={goalType}
              paymentStrategy={paymentStrategy}
              riskPercentage={riskPercentage}
              getRiskStatusDisplay={getRiskStatusDisplay}
            />



            {/* Main Tabs and Charts */}
            <MainTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentDebtTypeIndex={currentDebtTypeIndex}
              setCurrentDebtTypeIndex={setCurrentDebtTypeIndex}
              generateChartData={generateChartData}
              chartOptions={chartOptions}
              goToNextDebtType={goToNextDebtType}
              goToPrevDebtType={goToPrevDebtType}
              showAIRecommendation={showAIRecommendation}
              setShowAIRecommendation={setShowAIRecommendation}
              debtData={debtContext}
              onDebtTypeChange={(debtTypeId, newTimeInMonths, newInterestAmount) => {
                // Update the time and interest values based on debt type selection
                setTimeInMonths(newTimeInMonths);
                // Could also update interest amount if needed in the UI
                // This will sync with the calculation plan section
              }}
            />

            {/* Calculation Plan Section */}
            <CalulatePlanSection
              originalTimeInMonths={originalTimeInMonths}
              originalMonthlyPayment={originalMonthlyPayment}
              newPlanTimeInMonths={reducedTimeInMonths}
              newPlanMonthlyPayment={reducedMonthlyPayment}
              savedTimeInMonths={acceleratedTimeInMonths}
              savedAmount={acceleratedMonthlyPayment}
              currentDebtTypeId={currentDebtType.id}
            />

            {/* AI Recommendation Section */}
            <AiAdvisorSection
              showAIRecommendation={showAIRecommendation}
              setShowAIRecommendation={setShowAIRecommendation}
              monthlyPayment={monthlyPayment}
              timeInMonths={timeInMonths}
            />

            {/* Adjustable Plan Sliders */}
            <AdjustPlanScrollRange
              sliderValue={sliderValue}
              setSliderValue={setSliderValue}
              goalSliderValue={goalSliderValue}
              setGoalSliderValue={setGoalSliderValue}
              originalMonthlyPayment={originalMonthlyPayment}
              onValueChange={(paymentValue, goalValue) => {
                // Update monthly payment based on slider value
                setMonthlyPayment(paymentValue);
                
                // Adjust time in months based on payment changes
                const ratio = originalMonthlyPayment / paymentValue;
                const newTimeInMonths = Math.round(originalTimeInMonths * ratio);
                setTimeInMonths(newTimeInMonths);
                
                // Update reduced and accelerated values based on goal slider
                setReducedTimeInMonths(Math.round(newTimeInMonths * (1 - goalValue/100)));
                setAcceleratedTimeInMonths(Math.round(originalTimeInMonths - newTimeInMonths));
              }}
              onResetPlan={handleResetPlan}
            />

            {/* Error Message */}
            {saveError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{saveError}</p>
              </div>
            )}

            {/* Summary Stats */}

            <OverallDebtSection
              monthlyPayment={monthlyPayment}
              totalRepaymentAmount={monthlyPayment * timeInMonths}
              totalInterestSaved={(originalMonthlyPayment * originalTimeInMonths) - (monthlyPayment * timeInMonths)}
            />

            {/* Save Plan Button */}
            <Button
              className="w-full py-3 my-4"
              color="primary"
              isDisabled={isSaving}
              isLoading={isSaving}
              onPress={handleSavePlan}
            >
              {existingPlanId ? "อัพเดตแผนการชำระหนี้" : "ยืนยันแผนการชำระหนี้"}
            </Button>


          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
