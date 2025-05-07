"use client";

import React, { useState, useEffect } from "react";
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
import { FiX } from "react-icons/fi";

import { DebtItem } from "../types";

import PlanTopSummarySection from "./partials/PlanTopSummarySection";

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
import {
  DEBT_TYPES,
  formatNumber,
  calculateMinimumMonthlyPayment,
  calculateMonthsToDebtFree,
  calculateTotalInterestPaid,
} from "./utils/debtPlanUtils";

// Import new partials
import AiAdvisorSection from "./partials/AiAdvisorSection";
import MainTabs from "./partials/MainTabs";
import CalculatePlanSection from "./partials/CalculatePlanSection";
import AdjustPlanScrollRange from "./partials/AdjustPlanScrollRange";
import OverallDebtSection from "./partials/OverallDebtSection";
import { DebtPlan, DebtPlanModalProps } from "./types";
import SurveyModal from "./SurveyModal";
import MyDebtCarosel from "./partials/MyDebtCarosel";

import { useTracking } from "@/lib/tracking";
import { getDTIRiskStatus, saveDTIRiskAssessment } from "@/lib/dtiService";

export default function DebtPlanModal({
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
  // Initialize tracking functionality with limited events
  // Only track modal open, close, and save events
  const { trackRadarView, trackCompletion } = useTracking();
  
  // Track modal views with debounce to prevent excessive tracking
  const [lastTracked, setLastTracked] = useState<Date | null>(null);
  // Ref for modal content
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState<string>("ทั้งหมด");

  // Track only when modal is opened or closed (with 1-minute debounce)
  useEffect(() => {
    // Only track if we haven't tracked in the last minute
    const now = new Date();
    const shouldTrack = !lastTracked || 
                      now.getTime() - lastTracked.getTime() > 60000; // 1 minute debounce
    
    if (isOpen && shouldTrack) {
      // Track modal open
      trackRadarView();
      setLastTracked(now);
    } else if (!isOpen && lastTracked) {
      // Reset last tracked when modal closes
      setLastTracked(null);
    }
  }, [isOpen, trackRadarView, lastTracked]);

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
      // --- Use helper utils for accurate calculations ---
      const minPayment = calculateMinimumMonthlyPayment(debtContext);

      setMonthlyPayment(minPayment);
      setOriginalMonthlyPayment(minPayment);
      setSliderValue(minPayment);

      // Calculate months to freedom for original (minimum) payment
      const baseMonths = calculateMonthsToDebtFree(
        debtContext,
        minPayment,
        paymentStrategy as any,
      );

      setTimeInMonths(baseMonths);
      setOriginalTimeInMonths(baseMonths);

      // Propose a +20% payment for the comparison plan
      const proposalPayment = Math.round(minPayment * 1.2);

      setReducedMonthlyPayment(proposalPayment);

      const proposalMonths = calculateMonthsToDebtFree(
        debtContext,
        proposalPayment,
        paymentStrategy as any,
      );

      setReducedTimeInMonths(proposalMonths);

      // Time saved
      setAcceleratedTimeInMonths(baseMonths - proposalMonths);

      // Interest saved
      const originalInterest = calculateTotalInterestPaid(
        debtContext,
        minPayment,
        paymentStrategy as any,
      );
      const newInterest = calculateTotalInterestPaid(
        debtContext,
        proposalPayment,
        paymentStrategy as any,
      );

      setAcceleratedMonthlyPayment(Math.max(0, originalInterest - newInterest));
    }
  }, [debtContext, paymentStrategy, goalType]);

  // Calculate interest savings whenever monthly payment or strategy changes
  useEffect(() => {
    if (debtContext?.length > 0 && monthlyPayment > 0 && originalMonthlyPayment > 0) {
      const originalInterest = calculateTotalInterestPaid(
        debtContext,
        originalMonthlyPayment,
        paymentStrategy as any
      );
      
      const newInterest = calculateTotalInterestPaid(
        debtContext,
        monthlyPayment,
        paymentStrategy as any
      );
      
      // Store the interest difference for the savings display
      setAcceleratedMonthlyPayment(Math.max(0, originalInterest - newInterest));
    }
  }, [debtContext, monthlyPayment, originalMonthlyPayment, paymentStrategy]);

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
    alert("แผนการชำระหนี้ถูกรีเซ็ตเป็นค่าเริ่มต้น");
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
      const storedAnonymousId = localStorage.getItem("anonymousId");

      if (storedAnonymousId) {
        setAnonymousId(storedAnonymousId);
      } else {
        // Generate a new anonymous ID
        const newAnonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        localStorage.setItem("anonymousId", newAnonymousId);
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
        userId:
          userId || localStorage.getItem("anonymousId") || `anon_${Date.now()}`,
        anonymousId: !userId
          ? localStorage.getItem("anonymousId") || `anon_${Date.now()}`
          : undefined,
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

      // Save to database - use PUT for updates, POST for new plans
      const response = await fetch("/api/debt-plans", {
        method: existingPlanId ? "PUT" : "POST",
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
      setSaveError(
        error instanceof Error ? error.message : "Failed to save plan",
      );
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
          paymentOrder: getPaymentOrder(debt, index, paymentStrategy),
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

        console.log("Plan saved directly to database:", savedPlan);

        // Then notify parent component if callback exists
        if (onSavePlan) {
          try {
            // Include the saved plan ID from the database response if it's a new plan
            const planWithId =
              savedPlan && savedPlan._id && !plan.id
                ? { ...plan, id: savedPlan._id }
                : plan;

            await onSavePlan(planWithId as unknown as DebtPlan);
          } catch (parentError) {
            console.warn(
              "Parent onSavePlan callback failed, but plan was saved to database",
              parentError,
            );
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
  const getPaymentOrder = (
    debt: DebtItem,
    index: number,
    strategy: string,
  ): number => {
    // Default order (by index)
    if (!debtContext || debtContext.length === 0) return index + 1;

    // For Snowball strategy: order by remaining amount (smallest first)
    if (strategy === "Snowball") {
      return (
        debtContext
          .slice()
          .sort((a, b) => a.remainingAmount - b.remainingAmount)
          .findIndex((d) => d._id === debt._id) + 1
      );
    }

    // For Avalanche strategy: order by interest rate (highest first)
    if (strategy === "Avalanche") {
      return (
        debtContext
          .slice()
          .sort((a, b) => b.interestRate - a.interestRate)
          .findIndex((d) => d._id === debt._id) + 1
      );
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
    console.log(skipped ? "Survey skipped" : "Survey completed");
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
              getRiskStatusDisplay={getRiskStatusDisplay}
              goalType={goalType}
              paymentStrategy={paymentStrategy}
              riskPercentage={riskPercentage}
            />

            {/* Main Tabs and Charts */}
            <MainTabs
              activeTab={activeTab}
              chartOptions={chartOptions}
              currentDebtTypeIndex={currentDebtTypeIndex}
              debtData={debtContext}
              generateChartData={generateChartData}
              goToNextDebtType={goToNextDebtType}
              goToPrevDebtType={goToPrevDebtType}
              setActiveTab={setActiveTab}
              setCurrentDebtTypeIndex={setCurrentDebtTypeIndex}
              setShowAIRecommendation={setShowAIRecommendation}
              showAIRecommendation={showAIRecommendation}
              onDebtTypeChange={(
                debtTypeId,
                origTimeInMonths,
                newTimeInMonths,
                origMonthlyPayment,
                newMonthlyPayment,
                origInterestAmount,
                newInterestAmount,
              ) => {
                // Use the real calculated time values from MainTabs
                setOriginalTimeInMonths(origTimeInMonths);
                setReducedTimeInMonths(newTimeInMonths);

                // Calculate time saved (difference between original and new plan)
                const timeSaved = Math.max(
                  0,
                  origTimeInMonths - newTimeInMonths,
                );

                setAcceleratedTimeInMonths(timeSaved);

                // Use real payment amounts from calculations
                setOriginalMonthlyPayment(origMonthlyPayment);
                setReducedMonthlyPayment(newMonthlyPayment);

                // Calculate interest/money saved
                const interestSaved = Math.max(
                  0,
                  origInterestAmount - newInterestAmount,
                );

                setAcceleratedMonthlyPayment(Math.round(interestSaved));

                // Update the main time value for other calculations
                setTimeInMonths(newTimeInMonths);

                // Log real values for debugging
                if (process.env.NODE_ENV === "development") {
                  console.log("Debt type selected:", debtTypeId);
                  console.log("Original time (months):", origTimeInMonths);
                  console.log("New time (months):", newTimeInMonths);
                  console.log("Original monthly payment:", origMonthlyPayment);
                  console.log("New monthly payment:", newMonthlyPayment);
                  console.log("Original interest:", origInterestAmount);
                  console.log("New interest:", newInterestAmount);
                  console.log("Time saved:", timeSaved);
                  console.log("Interest saved:", interestSaved);
                }
              }}
            />

            {/* Interest values are calculated in a useEffect hook in the component body */}
            
            <CalculatePlanSection
              currentDebtTypeId={currentDebtType.id}
              newPlanMonthlyPayment={monthlyPayment}
              newPlanTimeInMonths={timeInMonths}
              originalMonthlyPayment={originalMonthlyPayment}
              originalTimeInMonths={originalTimeInMonths}
              savedAmount={acceleratedMonthlyPayment} // Use the calculated interest difference
              savedTimeInMonths={Math.max(0, originalTimeInMonths - timeInMonths)}
            />

            {/* AI Recommendation Section */}
            <AiAdvisorSection
              monthlyPayment={monthlyPayment}
              setShowAIRecommendation={setShowAIRecommendation}
              showAIRecommendation={showAIRecommendation}
              timeInMonths={timeInMonths}
            />

            {/* My Debt Section */}
            <MyDebtCarosel
              activeFilter={activeFilter}
              debts={debtContext}
              formatNumber={formatNumber}
            />

            {/* Adjustable Plan Sliders */}
            <AdjustPlanScrollRange
              goalSliderValue={goalSliderValue}
              originalMonthlyPayment={originalMonthlyPayment}
              setGoalSliderValue={setGoalSliderValue}
              setSliderValue={setSliderValue}
              sliderValue={sliderValue}
              onResetPlan={handleResetPlan}
              onValueChange={(paymentValue, goalValue) => {
                // Update monthly payment based on slider value
                setMonthlyPayment(paymentValue);

                // Re-calculate payoff time with real formula
                const monthsNeeded = calculateMonthsToDebtFree(
                  debtContext,
                  paymentValue,
                  paymentStrategy as any,
                );

                setTimeInMonths(monthsNeeded);

                // Update reduced & accelerated metrics
                setReducedTimeInMonths(monthsNeeded);
                setAcceleratedTimeInMonths(
                  Math.max(0, originalTimeInMonths - monthsNeeded),
                );

                const originalInterest = calculateTotalInterestPaid(
                  debtContext,
                  originalMonthlyPayment,
                  paymentStrategy as any,
                );
                const newInterest = calculateTotalInterestPaid(
                  debtContext,
                  paymentValue,
                  paymentStrategy as any,
                );

                setAcceleratedMonthlyPayment(
                  Math.max(0, originalInterest - newInterest),
                );
              }}
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
              totalInterestSaved={
                Math.max(0, 
                  (originalMonthlyPayment * originalTimeInMonths) -
                  (monthlyPayment * timeInMonths)
                )
              }
              totalRepaymentAmount={monthlyPayment * timeInMonths}
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
              onComplete={handleSurveyComplete}
              onOpenChange={setIsSurveyModalOpen}
            />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
