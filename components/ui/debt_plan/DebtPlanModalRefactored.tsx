"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import {
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiArrowRight,
  FiInfo,
} from "react-icons/fi";
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
import { Line, Bar } from "react-chartjs-2";

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
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">เป้าหมายที่เลือก:</p>
                <p className="font-medium">{goalType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">รูปแบบแผนการชำระหนี้:</p>
                <p className="font-medium">{paymentStrategy}</p>
              </div>
              {getRiskStatusDisplay()}
            </div>

            {/* AI Recommendation Section */}
            <div className="mb-4">
              <button
                type="button"
                className="w-full flex items-center justify-between bg-blue-50 p-3 rounded-t-lg cursor-pointer"
                onClick={() => setShowAIRecommendation(!showAIRecommendation)}
                aria-expanded={showAIRecommendation}
                aria-controls="ai-recommendation-content"
              >
                <div className="flex items-center">
                  <FiInfo className="text-blue-500 mr-2" />
                  <span className="font-medium">ดูคำแนะนำจาก AI Advisor</span>
                </div>
                {showAIRecommendation ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {showAIRecommendation && (
                <div
                  id="ai-recommendation-content"
                  className="bg-blue-50 p-3 rounded-b-lg"
                >
                  <p className="text-sm">
                    จากการวิเคราะห์ข้อมูลหนี้ของคุณ
                    เราแนะนำให้เพิ่มยอดชำระต่อเดือนเป็น{" "}
                    {formatNumber(monthlyPayment * 1.2)} บาท
                    เพื่อลดระยะเวลาการชำระหนี้ลงเหลือ{" "}
                    {Math.round(timeInMonths * 0.8)} เดือน
                    และประหยัดดอกเบี้ยได้ถึง{" "}
                    {formatNumber(monthlyPayment * timeInMonths * 0.05 * 0.2)}{" "}
                    บาท
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

            {/* Tabs */}
            <div className="flex border-b mb-4">
              {["ยอดหนี้รวม", "ยอดหนี้รายก้อน"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-600"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Debt Type Selection */}
            <div className="flex justify-between items-center mb-4">
              <button
                aria-label="ประเภทหนี้ก่อนหน้า"
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={goToPrevDebtType}
              >
                <FiArrowLeft />
              </button>

              <h3 className="text-center font-medium">
                {currentDebtType.label}
              </h3>

              <button
                aria-label="ประเภทหนี้ถัดไป"
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={goToNextDebtType}
              >
                <FiArrowRight />
              </button>
            </div>

            {/* Debt Trend Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">แนวโน้มการชำระหนี้</h3>
                <div className="flex items-center space-x-2">
                  <button
                    aria-label="Toggle AI recommendation"
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    onClick={() =>
                      setShowAIRecommendation(!showAIRecommendation)
                    }
                  >
                    <FiInfo size={14} />
                  </button>
                </div>
              </div>
              <div className="h-64 border border-gray-200 rounded-lg p-2">
                {activeTab === "ยอดหนี้รวม" ? (
                  <Line
                    data={generateChartData(currentDebtType.id)}
                    options={chartOptions}
                  />
                ) : (
                  <Bar
                    data={{
                      labels: ["Debt A", "Debt B", "Debt C"],
                      datasets: [
                        {
                          label: "แผนเดิม",
                          data: [80000, 60000, 40000],
                          backgroundColor: "#F59E0B",
                        },
                        {
                          label: "แผนใหม่",
                          data: [70000, 50000, 30000],
                          backgroundColor: "#3B82F6",
                        },
                      ],
                    }}
                    options={{
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
                            callback: function (
                              this: any,
                              value: string | number,
                            ) {
                              return typeof value === "number"
                                ? value.toLocaleString("th-TH")
                                : value;
                            },
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: "ชื่อหนี้",
                          },
                        },
                      },
                      plugins: chartOptions.plugins,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-1 mb-4">
              {DEBT_TYPES.map((type, index) => (
                <div
                  key={type.id}
                  className={`w-2 h-2 rounded-full ${index === currentDebtTypeIndex ? "bg-blue-500" : "bg-gray-300"}`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                className="flex items-center justify-center gap-2"
                color="primary"
                variant="light"
              >
                <span>เวลาที่ใช้</span>
              </Button>
              <Button
                className="flex items-center justify-center gap-2"
                color="primary"
                variant="light"
              >
                <span>เงินที่ใช้ไป</span>
              </Button>
            </div>

            {/* Payment Comparison */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-100 p-2 rounded-lg">
                <p className="text-xs text-gray-600 text-center">แผนเดิม</p>
                <p className="text-center font-medium">
                  {originalTimeInMonths} เดือน
                </p>
                <p className="text-center text-sm text-blue-600">
                  {formatNumber(originalMonthlyPayment)} บาท
                </p>
                <div className="flex justify-center">
                  <FiChevronDown className="text-gray-500" />
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded-lg">
                <p className="text-xs text-gray-600 text-center">แผนใหม่</p>
                <p className="text-center font-medium">
                  {reducedTimeInMonths} เดือน
                </p>
                <p className="text-center text-sm text-blue-600">
                  {formatNumber(reducedMonthlyPayment)} บาท
                </p>
                <div className="flex justify-center">
                  <FiChevronDown className="text-gray-500" />
                </div>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <p className="text-xs text-gray-600 text-center">เร่งด่วน</p>
                <p className="text-center font-medium">
                  {acceleratedTimeInMonths} เดือน
                </p>
                <p className="text-center text-sm text-blue-600">
                  {formatNumber(acceleratedMonthlyPayment)} บาท
                </p>
                <div className="flex justify-center">
                  <FiChevronDown className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Comparison Details Toggle */}
            <button
              className="w-full flex items-center justify-center gap-1 text-blue-600 mb-4"
              onClick={() => setShowComparisonDetails(!showComparisonDetails)}
            >
              {showComparisonDetails ? (
                <>
                  <span>ซ่อนรายละเอียด</span>
                  <FiChevronUp />
                </>
              ) : (
                <>
                  <span>ดูรายละเอียดเพิ่มเติม</span>
                  <FiChevronDown />
                </>
              )}
            </button>

            {/* Comparison Details */}
            {showComparisonDetails && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">ยอดชำระต่อเดือน/เดือน</span>
                  <span className="text-sm font-medium">
                    {formatNumber(monthlyPayment)} บาท
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">ยอดที่ชำระทั้งหมด</span>
                  <span className="text-sm font-medium">
                    {formatNumber(monthlyPayment * timeInMonths)} บาท
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">ดอกเบี้ยที่ต้องจ่าย</span>
                  <span className="text-sm font-medium">
                    {formatNumber(monthlyPayment * timeInMonths * 0.05)} บาท
                  </span>
                </div>
              </div>
            )}

            {/* Adjust Plan Section */}
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h3 className="text-center font-medium mb-4">
                ปรับแต่งแผนด้วยตัวคุณเอง
              </h3>

              {/* Payment Amount Slider */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="payment-slider"
                  >
                    จำนวนเงินโปะ / เดือน
                  </label>
                  <span className="text-sm font-medium">
                    {formatNumber(sliderValue)} บาท
                  </span>
                </div>
                <input
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  id="payment-slider"
                  max={originalMonthlyPayment * 3}
                  min={originalMonthlyPayment * 0.5}
                  step={100}
                  type="range"
                  value={sliderValue}
                  onChange={handleSliderChange}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>2,000</span>
                </div>
              </div>

              {/* Goal Balance Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="goal-slider"
                  >
                    น้ำหนักเป้าหมาย
                  </label>
                </div>
                <input
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  id="goal-slider"
                  max={100}
                  min={0}
                  step={1}
                  type="range"
                  value={goalSliderValue}
                  onChange={handleGoalSliderChange}
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>เห็นผลเร็ว</span>
                  <span>ประหยัดดอกเบี้ย</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {saveError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{saveError}</p>
              </div>
            )}

            {/* Save Plan Button */}
            <Button
              className="w-full py-3 mb-4"
              color="primary"
              isDisabled={isSaving}
              isLoading={isSaving}
              onPress={handleSavePlan}
            >
              {existingPlanId ? "อัพเดตแผนการชำระหนี้" : "ยืนยันแผนการชำระหนี้"}
            </Button>

            {/* Summary Stats */}
            <div className="bg-blue-500 text-white p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm">ยอดชำระต่อเดือน/เดือน</p>
                  <p className="text-xl font-bold">
                    {formatNumber(monthlyPayment)} บาท
                  </p>
                </div>
                <div>
                  <p className="text-sm">ยอดที่ชำระทั้งหมด</p>
                  <p className="text-xl font-bold">
                    {formatNumber(monthlyPayment * timeInMonths)} บาท
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
