import React, { useEffect, useState, useCallback } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
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
  Filler,
} from "chart.js";

import { DEBT_TYPES } from "../utils/debtPlanUtils";
import { DebtItem } from "../../types";

import { DebtPlanData } from "./types";

// Import refactored chart components
import {
  LineChartComponent,
  BarChartComponent,
  DebtTypeSummary,
  processDebtData as processDebtDataUtil,
} from "./chart_summary";

// Register ChartJS components including Filler plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// Interface for API response
interface DebtApiResponse {
  debts: DebtItem[];
}

interface MainTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentDebtTypeIndex: number;
  setCurrentDebtTypeIndex: (index: number) => void;
  chartOptions: any;
  goToNextDebtType: () => void;
  goToPrevDebtType: () => void;
  showAIRecommendation: boolean;
  setShowAIRecommendation: (show: boolean) => void;
  debtData?: DebtItem[];
  generateChartData?: any; // Add the missing prop that's being passed from DebtPlanModal
  onDebtTypeChange?: (
    debtTypeId: string,
    originalTimeInMonths: number,
    newPlanTimeInMonths: number,
    originalMonthlyPayment: number,
    newPlanMonthlyPayment: number,
    originalInterest: number,
    newPlanInterest: number,
  ) => void;
}

export default function MainTabs({
  activeTab,
  setActiveTab,
  currentDebtTypeIndex,
  setCurrentDebtTypeIndex,
  chartOptions,
  goToNextDebtType,
  goToPrevDebtType,
  showAIRecommendation,
  setShowAIRecommendation,
  debtData,
  onDebtTypeChange,
}: MainTabsProps) {
  // States for component
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncedDebtData, setSyncedDebtData] = useState<
    Record<string, DebtPlanData>
  >({});

  // Get current debt type
  const currentDebtType = DEBT_TYPES[currentDebtTypeIndex];

  // Handle local navigation between debt types with data updates
  const handlePrevDebtType = useCallback(() => {
    goToPrevDebtType();
    // Data will automatically update via useEffect based on currentDebtTypeIndex change
  }, [goToPrevDebtType]);

  const handleNextDebtType = useCallback(() => {
    goToNextDebtType();
    // Data will automatically update via useEffect based on currentDebtTypeIndex change
  }, [goToNextDebtType]);

  // Process debt data when it's available
  useEffect(() => {
    if (debtData && debtData.length > 0) {
      setIsLoading(true);
      try {
        // Use the utility function to process debt data
        const processedData = processDebtDataUtil(debtData);

        setSyncedDebtData(processedData);
      } catch (err) {
        console.error("Error processing debt data:", err);
        setError("เกิดข้อผิดพลาดในการประมวลผลข้อมูล");
      } finally {
        setIsLoading(false);
      }
    }
  }, [debtData]);

  // Create a fallback sample data for visualization if no real data is available
  const createSampleData = (debtTypeId: string, label: string) => {
    // Sample amounts - these will show a meaningful chart even with no real data
    const sampleAmount = 100000;
    const sampleReducedAmount = 90000;
    const originalMonths = 24;
    const newPlanMonths = 20;

    // Create sample monthly data points for the chart
    const monthlyData = [];

    for (let i = 0; i < Math.max(originalMonths, newPlanMonths); i++) {
      const month = i + 1;
      const originalRate = sampleAmount / originalMonths;
      const newRate = sampleReducedAmount / newPlanMonths;

      monthlyData.push({
        month,
        originalAmount: Math.max(0, sampleAmount - originalRate * month),
        newPlanAmount: Math.max(0, sampleReducedAmount - newRate * month),
      });
    }

    return {
      id: debtTypeId,
      label: label,
      originalTotalAmount: sampleAmount,
      newPlanTotalAmount: sampleReducedAmount,
      originalTimeInMonths: originalMonths,
      newPlanTimeInMonths: newPlanMonths,
      originalInterest: sampleAmount * 0.15, // 15% interest estimate
      newPlanInterest: sampleReducedAmount * 0.12, // 12% interest estimate
      monthlyData: monthlyData,
    };
  };

  // Get current debt data with fallback to sample data
  const currentDebtData =
    syncedDebtData[currentDebtType.id] ||
    (Object.keys(syncedDebtData).length > 0
      ? syncedDebtData["total"]
      : createSampleData(currentDebtType.id, currentDebtType.label));

  // Add effect to refresh data when debt type changes
  useEffect(() => {
    console.log("Current debt type changed to:", currentDebtType.label);
    // This will trigger a re-render with the new debt type data

    if (syncedDebtData && currentDebtType.id) {
      const data =
        syncedDebtData[currentDebtType.id] ||
        (Object.keys(syncedDebtData).length > 0
          ? syncedDebtData["total"]
          : null);

      if (data && onDebtTypeChange) {
        // Calculate minimum payment
        const minMonthlyPayment =
          data.originalTotalAmount / data.originalTimeInMonths;
        const recommendedMonthlyPayment =
          data.newPlanTotalAmount / data.newPlanTimeInMonths;

        // Notify parent component of the change
        onDebtTypeChange(
          currentDebtType.id,
          data.originalTimeInMonths,
          data.newPlanTimeInMonths,
          minMonthlyPayment,
          recommendedMonthlyPayment,
          data.originalInterest,
          data.newPlanInterest,
        );
      }
    }
  }, [
    currentDebtType.id,
    currentDebtTypeIndex,
    syncedDebtData,
    onDebtTypeChange,
  ]);

  // Notify parent component when debt type changes
  useEffect(() => {
    if (onDebtTypeChange && Object.keys(syncedDebtData).length > 0) {
      const data =
        syncedDebtData[currentDebtType.id] || syncedDebtData["total"];

      if (data) {
        // Calculate minimum and recommended monthly payments
        const minMonthlyPayment =
          data.originalTimeInMonths > 0
            ? data.originalTotalAmount / data.originalTimeInMonths
            : 0;

        const recommendedMonthlyPayment =
          data.newPlanTimeInMonths > 0
            ? data.newPlanTotalAmount / data.newPlanTimeInMonths
            : 0;

        // Provide data to parent component
        onDebtTypeChange(
          currentDebtType.id,
          data.originalTimeInMonths,
          data.newPlanTimeInMonths,
          minMonthlyPayment,
          recommendedMonthlyPayment,
          data.originalInterest,
          data.newPlanInterest,
        );
      }
    }
  }, [
    currentDebtType.id,
    currentDebtTypeIndex,
    onDebtTypeChange,
    syncedDebtData,
  ]);

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
      {/* Debt Type Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button
          aria-label="Previous debt type"
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          disabled={isLoading}
          onClick={handlePrevDebtType}
        >
          <FiArrowLeft />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-medium">{currentDebtType.label}</h2>
        </div>

        <button
          aria-label="Next debt type"
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          disabled={isLoading}
          onClick={handleNextDebtType}
        >
          <FiArrowRight />
        </button>
      </div>

      {/* Debt Type Summary Card - Using our new DebtTypeSummary component */}
      <DebtTypeSummary
        currentDebtType={currentDebtType}
        debtData={currentDebtData}
      />

      {/* Main Content */}
      <div className="flex-1 p-4">
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

        {/* Chart Area */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Chart display based on selected tab */}
            {activeTab === "ยอดหนี้รวม" ? (
              <LineChartComponent
                chartOptions={chartOptions}
                debtTypeData={currentDebtData}
              />
            ) : (
              <BarChartComponent
                chartOptions={chartOptions}
                debtDataByType={syncedDebtData}
              />
            )}
          </>
        )}
      </div>

      {/* Pagination Dots for Debt Type Navigation */}
      <div className="flex justify-center gap-1 mb-4">
        {DEBT_TYPES.map((type, index) => (
          <div
            key={type.id}
            aria-label={`Select ${type.label} debt type`}
            className={`w-2 h-2 rounded-full ${index === currentDebtTypeIndex ? "bg-blue-500" : "bg-gray-300"}`}
            role="button"
            style={{ cursor: "pointer" }}
            tabIndex={0}
            onClick={() => setCurrentDebtTypeIndex(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setCurrentDebtTypeIndex(index);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
