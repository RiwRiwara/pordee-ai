"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
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
import { useSession } from "next-auth/react";
import { getDTIRiskStatus, saveDTIRiskAssessment } from "@/lib/dtiService";

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
import { DEBT_TYPES } from "./utils/debtPlanUtils";
import { useTracking } from "@/lib/tracking";

// Import new partials
import PlanTopSummarySection from "./partials/PlanTopSummarySection";
import AiAdvisorSection from "./partials/AiAdvisorSection";
import MainTabs from "./partials/MainTabs";
import CalulatePlanSection from "./partials/CalulatePlanSection";
import AdjustPlanScrollRange from "./partials/AdjustPlanScrollRange";
import OverallDebtSection from "./partials/OverallDebtSection";
import { DebtPlan, DebtPlanModalProps } from "./types";
import { DebtItem } from "../types";
import { FiX } from "react-icons/fi";
import SurveyModal from "./SurveyModal";

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
  // Initialize tracking functionality
  const { trackRadarView, trackEdit, trackCompletion } = useTracking();
  // Ref for modal content
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);


  // Track when user views the radar page
  useEffect(() => {
    if (isOpen) {
      trackRadarView();
    }
  }, [isOpen, trackRadarView]);

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
  const [currentDebtTypeIndex, setCurrentDebtTypeIndex] = useState<number>(0);
  const [showAIRecommendation, setShowAIRecommendation] =
    useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");

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



  // Update payment strategy based on goal slider
  useEffect(() => {
    if (goalSliderValue < 40) {
      setPaymentStrategy("Snowball");
      setGoalType("เห็นผลเร็ว");
    } else if (goalSliderValue > 60) {
      setPaymentStrategy("Avalanche");
      setGoalType("คุ้มดอกเบี้ย");
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

  // Get track color based on risk percentage
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

  // Get the user session if available
  const { data: session } = useSession();

  // Anonymous user ID management
  const [anonymousId, setAnonymousId] = useState<string>("");

  // Initialize anonymous ID on component mount if user is not logged in
  useEffect(() => {
    // Only create anonymous ID if user is not logged in
    if (!session?.user) {
      // Try to get existing anonymous ID from localStorage
      const storedAnonymousId = localStorage.getItem('anonymousId');
      if (storedAnonymousId) {
        setAnonymousId(storedAnonymousId);
      } else {
        // Generate a new anonymous ID
        const newAnonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('anonymousId', newAnonymousId);
        setAnonymousId(newAnonymousId);
      }
    }
  }, [session]);

  // Direct API call to save debt plan
  const saveDebtPlanToDatabase = async (planData: any) => {
    try {
      setIsSaving(true);
      setSaveError("");

      // Use the session from the component scope instead of calling useSession() here
      const userId = session?.user?.id;

      // Prepare plan data
      const debtPlanData = {
        ...planData,
        userId: userId || localStorage.getItem("anonymousId") || `anon_${Date.now()}`,
        anonymousId: !userId ? localStorage.getItem("anonymousId") || `anon_${Date.now()}` : undefined,
        isActive: true,
      };

      // If no anonymous ID in localStorage and no user ID, create and store one
      if (!userId && !localStorage.getItem("anonymousId")) {
        const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem("anonymousId", anonymousId);
        debtPlanData.anonymousId = anonymousId;
        debtPlanData.userId = anonymousId;
      }

      // Add existing plan ID if updating
      if (existingPlanId) {
        debtPlanData._id = existingPlanId;
      }

      // Save to database
      const response = await fetch("/api/debt-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(debtPlanData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save plan: ${response.status}`);
      }

      // Also save the DTI risk assessment if we have a user ID
      if (userId) {
        await saveDTIRiskAssessment(userId, riskPercentage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error saving debt plan:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to save plan");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save plan
  const handleSavePlan = async () => {
    try {
      setIsSaving(true);
      setSaveError("");

      // Validate required data
      if (!debtContext || debtContext.length === 0) {
        setSaveError("ไม่พบข้อมูลหนี้ กรุณาเพิ่มข้อมูลหนี้ก่อนสร้างแผน");
        return;
      }

      if (monthlyPayment <= 0) {
        setSaveError("กรุณาระบุยอดชำระรายเดือนที่มากกว่า 0");
        return;
      }

      // Get current selected debt type
      const currentDebtType = DEBT_TYPES[currentDebtTypeIndex];

      // Create debt items from debtContext with proper validation
      const debtItems = debtContext.map((debt, index) => {
        // Ensure all required fields have valid values
        if (!debt._id) {
          console.warn("Debt missing _id, using fallback");
        }

        return {
          debtId: debt._id || new Date().getTime().toString(),
          name: debt.name || `หนี้ ${index + 1}`,
          debtType: debt.debtType || "other",
          originalAmount: debt.totalAmount || debt.remainingAmount || 0,
          remainingAmount: debt.remainingAmount || 0,
          interestRate: debt.interestRate || 0,
          minimumPayment: debt.minimumPayment || 0,
          paymentOrder: getPaymentOrder(debt, index, paymentStrategy)
        };
      });

      // Create plan object with all necessary data
      const plan = {
        id: existingPlanId,
        goalType,
        paymentStrategy,
        monthlyPayment,
        timeInMonths,
        debtTypeId: currentDebtType.id,
        debtItems,
        isActive: true,
        customSettings: {
          goalBalance: goalSliderValue,
        },
      };

      // Always try the direct API call first to ensure data is saved to the database
      try {
        // Save directly to database first
        const savedPlan = await saveDebtPlanToDatabase(plan);
        console.log('Plan saved directly to database:', savedPlan);

        // Then notify parent component if callback exists
        if (onSavePlan) {
          try {
            // Include the saved plan ID from the database response if it's a new plan
            const planWithId = savedPlan && savedPlan._id && !plan.id
              ? { ...plan, id: savedPlan._id }
              : plan;

            await onSavePlan(planWithId as unknown as DebtPlan);
          } catch (parentError) {
            console.warn("Parent onSavePlan callback failed, but plan was saved to database", parentError);
            // Plan is already saved to database, so we can continue
          }
        }
      } catch (error) {
        console.error("Failed to save plan to database:", error);
        throw error; // Re-throw to be caught by the outer try-catch
      }

      // Track completion when plan is saved
      trackCompletion(true);

      // Open survey modal instead of closing the debt plan modal
      setIsSurveyModalOpen(true);
    } catch (error) {
      console.error("Error saving plan:", error);
      setSaveError("เกิดข้อผิดพลาดในการบันทึกแผน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to determine payment order based on strategy
  const getPaymentOrder = (debt: DebtItem, index: number, strategy: string): number => {
    // Default order (by index)
    if (!debtContext || debtContext.length === 0) return index + 1;

    // For Snowball strategy: order by remaining amount (smallest first)
    if (strategy === "Snowball") {
      return debtContext
        .slice()
        .sort((a, b) => a.remainingAmount - b.remainingAmount)
        .findIndex(d => d._id === debt._id) + 1;
    }

    // For Avalanche strategy: order by interest rate (highest first)
    if (strategy === "Avalanche") {
      return debtContext
        .slice()
        .sort((a, b) => b.interestRate - a.interestRate)
        .findIndex(d => d._id === debt._id) + 1;
    }

    // For Proportional/Balanced strategy: use default order
    return index + 1;
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

  const handleSurveyComplete = (skipped = false) => {
    setIsSurveyModalOpen(false);
    
    // Only now close the debt plan modal after survey is completed or skipped
    onOpenChange(false);
    
    // Log whether survey was completed or skipped
    console.log(skipped ? 'Survey skipped' : 'Survey completed');
  };

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
                setReducedTimeInMonths(Math.round(newTimeInMonths * (1 - goalValue / 100)));
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

            <SurveyModal
              isOpen={isSurveyModalOpen}
              onOpenChange={setIsSurveyModalOpen}
              onComplete={handleSurveyComplete}
            />

          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
