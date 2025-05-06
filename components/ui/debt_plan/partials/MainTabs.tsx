import React, { useEffect, useState, useCallback } from 'react';
import { FiArrowLeft, FiArrowRight, FiInfo } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
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
} from 'chart.js';
import { DEBT_TYPES, InterestCalculationMethod, calculateTimeToPayOffReducingBalance, calculateTimeToPayOffFixedInterest, calculateRemainingDebtReducingBalance, calculateRemainingDebtFixedInterest } from '../utils/debtPlanUtils';
import { DebtItem } from '../../types';

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
  Filler
);

// Define types for debt data
interface DebtPlanData {
  id: string;
  label: string;
  originalTotalAmount: number;
  newPlanTotalAmount: number;
  originalTimeInMonths: number;
  newPlanTimeInMonths: number;
  originalInterest: number;
  newPlanInterest: number;
  monthlyData: {
    month: number;
    originalAmount: number;
    newPlanAmount: number;
  }[];
}

// Interface for API response
interface DebtApiResponse {
  debts: DebtItem[];
}

interface MainTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentDebtTypeIndex: number;
  setCurrentDebtTypeIndex: (index: number) => void;
  generateChartData: (debtTypeId: string) => any;
  chartOptions: any;
  goToNextDebtType: () => void;
  goToPrevDebtType: () => void;
  showAIRecommendation: boolean;
  setShowAIRecommendation: (show: boolean) => void;
  debtData?: DebtItem[];
  onDebtTypeChange?: (debtTypeId: string, timeInMonths: number, interestAmount: number) => void;
}

// Sample data for debt plans by type
const SAMPLE_DEBT_DATA: Record<string, DebtPlanData> = {
  'total': {
    id: 'total',
    label: 'ยอดหนี้รวม',
    originalTotalAmount: 180000,
    newPlanTotalAmount: 150000,
    originalTimeInMonths: 24,
    newPlanTimeInMonths: 20,
    originalInterest: 18000,
    newPlanInterest: 12500,
    monthlyData: Array.from({ length: 24 }, (_, i) => ({
      month: i + 1,
      originalAmount: Math.max(0, 180000 - (i * 7500)),
      newPlanAmount: Math.max(0, 150000 - (i * 8500))
    }))
  },
  'credit_card': {
    id: 'credit_card',
    label: 'บัตรเครดิต',
    originalTotalAmount: 80000,
    newPlanTotalAmount: 70000,
    originalTimeInMonths: 24,
    newPlanTimeInMonths: 18,
    originalInterest: 12000,
    newPlanInterest: 8500,
    monthlyData: Array.from({ length: 24 }, (_, i) => ({
      month: i + 1,
      originalAmount: Math.max(0, 80000 - (i * 3500)),
      newPlanAmount: Math.max(0, 70000 - (i * 4200))
    }))
  },
  'personal_loan': {
    id: 'personal_loan',
    label: 'สินเชื่อส่วนบุคคล',
    originalTotalAmount: 60000,
    newPlanTotalAmount: 50000,
    originalTimeInMonths: 24,
    newPlanTimeInMonths: 20,
    originalInterest: 6000,
    newPlanInterest: 4000,
    monthlyData: Array.from({ length: 24 }, (_, i) => ({
      month: i + 1,
      originalAmount: Math.max(0, 60000 - (i * 2500)),
      newPlanAmount: Math.max(0, 50000 - (i * 2800))
    }))
  },
  'auto_loan': {
    id: 'auto_loan',
    label: 'สินเชื่อรถยนต์',
    originalTotalAmount: 40000,
    newPlanTotalAmount: 30000,
    originalTimeInMonths: 24,
    newPlanTimeInMonths: 22,
    originalInterest: 2000,
    newPlanInterest: 1200,
    monthlyData: Array.from({ length: 24 }, (_, i) => ({
      month: i + 1,
      originalAmount: Math.max(0, 40000 - (i * 1800)),
      newPlanAmount: Math.max(0, 30000 - (i * 1400))
    }))
  },
  'mortgage': {
    id: 'mortgage',
    label: 'สินเชื่อบ้าน',
    originalTotalAmount: 150000,
    newPlanTotalAmount: 130000,
    originalTimeInMonths: 36,
    newPlanTimeInMonths: 32,
    originalInterest: 15000,
    newPlanInterest: 11000,
    monthlyData: Array.from({ length: 36 }, (_, i) => ({
      month: i + 1,
      originalAmount: Math.max(0, 150000 - (i * 4200)),
      newPlanAmount: Math.max(0, 130000 - (i * 4100))
    }))
  },
  'education_loan': {
    id: 'education_loan',
    label: 'สินเชื่อการศึกษา',
    originalTotalAmount: 25000,
    newPlanTotalAmount: 22000,
    originalTimeInMonths: 20,
    newPlanTimeInMonths: 18,
    originalInterest: 1500,
    newPlanInterest: 1000,
    monthlyData: Array.from({ length: 20 }, (_, i) => ({
      month: i + 1,
      originalAmount: Math.max(0, 25000 - (i * 1300)),
      newPlanAmount: Math.max(0, 22000 - (i * 1250))
    }))
  },
  'other': {
    id: 'other',
    label: 'หนี้อื่นๆ',
    originalTotalAmount: 15000,
    newPlanTotalAmount: 12000,
    originalTimeInMonths: 12,
    newPlanTimeInMonths: 10,
    originalInterest: 800,
    newPlanInterest: 500,
    monthlyData: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      originalAmount: Math.max(0, 15000 - (i * 1300)),
      newPlanAmount: Math.max(0, 12000 - (i * 1250))
    }))
  }
};

export default function MainTabs({
  activeTab,
  setActiveTab,
  currentDebtTypeIndex,
  setCurrentDebtTypeIndex,
  generateChartData,
  chartOptions,
  goToNextDebtType,
  goToPrevDebtType,
  showAIRecommendation,
  setShowAIRecommendation,
  debtData,
  onDebtTypeChange
}: MainTabsProps) {
  const currentDebtType = DEBT_TYPES[currentDebtTypeIndex];
  const [syncedDebtData, setSyncedDebtData] = useState<Record<string, DebtPlanData>>(SAMPLE_DEBT_DATA);
  const [calculationMethod, setCalculationMethod] = useState<InterestCalculationMethod>(InterestCalculationMethod.REDUCING_BALANCE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch debt data from the API
  const fetchDebtData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/debts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch debt data');
      }
      
      const data: DebtApiResponse = await response.json();
      
      if (data && data.debts) {
        // Process the debt data and update the state
        const processedData = processDebtData(data.debts);
        setSyncedDebtData(processedData);
      }
    } catch (err) {
      console.error('Error fetching debt data:', err);
      setError('Failed to fetch debt data. Using sample data instead.');
      // Keep using sample data if there's an error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Process the debt data from the API and calculate payment plans
  const processDebtData = (debts: DebtItem[]): Record<string, DebtPlanData> => {
    if (!debts || debts.length === 0) {
      return SAMPLE_DEBT_DATA; // Return sample data if no debts
    }

    const result: Record<string, DebtPlanData> = {};
    
    // Group debts by type
    const debtsByType: Record<string, DebtItem[]> = {};
    
    // Initialize with total
    debtsByType['total'] = [...debts];
    
    // Group by debt type
    debts.forEach(debt => {
      const debtTypeId = DEBT_TYPES.find(type => 
        type.label === debt.debtType || 
        (type.id === 'credit_card' && debt.debtType === 'บัตรเครดิต') ||
        (type.id === 'personal' && debt.debtType === 'สินเชื่อส่วนบุคคล') ||
        (type.id === 'car' && debt.debtType === 'สินเชื่อรถยนต์') ||
        (type.id === 'home' && debt.debtType === 'สินเชื่อบ้าน')
      )?.id || 'other';
      
      if (!debtsByType[debtTypeId]) {
        debtsByType[debtTypeId] = [];
      }
      
      debtsByType[debtTypeId].push(debt);
    });
    
    // Calculate data for each debt type
    Object.entries(debtsByType).forEach(([debtTypeId, typeDebts]) => {
      // Skip if no debts for this type
      if (typeDebts.length === 0) return;
      
      // Find the corresponding debt type label
      const debtTypeLabel = DEBT_TYPES.find(type => type.id === debtTypeId)?.label || 'อื่นๆ';
      
      // Calculate totals
      const totalRemainingAmount = typeDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
      const avgInterestRate = typeDebts.reduce((sum, debt) => sum + debt.interestRate, 0) / typeDebts.length;
      
      // Calculate minimum payment (use existing or 3% of balance)
      const minMonthlyPayment = typeDebts.reduce((sum, debt) => {
        return sum + (debt.minimumPayment || Math.max(debt.remainingAmount * 0.03, 500));
      }, 0);
      
      // Calculate recommended payment (20% higher than minimum)
      const recommendedMonthlyPayment = minMonthlyPayment * 1.2;
      
      // Calculate time to pay off for both payment plans based on the selected calculation method
      let originalTimeInMonths, newPlanTimeInMonths;
      
      if (calculationMethod === InterestCalculationMethod.REDUCING_BALANCE) {
        originalTimeInMonths = calculateTimeToPayOffReducingBalance(
          totalRemainingAmount, avgInterestRate, minMonthlyPayment
        );
        newPlanTimeInMonths = calculateTimeToPayOffReducingBalance(
          totalRemainingAmount, avgInterestRate, recommendedMonthlyPayment
        );
      } else {
        originalTimeInMonths = calculateTimeToPayOffFixedInterest(
          totalRemainingAmount, avgInterestRate, minMonthlyPayment
        );
        newPlanTimeInMonths = calculateTimeToPayOffFixedInterest(
          totalRemainingAmount, avgInterestRate, recommendedMonthlyPayment
        );
      }
      
      // Cap at reasonable values
      originalTimeInMonths = Math.min(originalTimeInMonths, 120); // Max 10 years
      newPlanTimeInMonths = Math.min(newPlanTimeInMonths, 120); // Max 10 years
      
      // Calculate total interest paid
      const originalInterest = (minMonthlyPayment * originalTimeInMonths) - totalRemainingAmount;
      const newPlanInterest = (recommendedMonthlyPayment * newPlanTimeInMonths) - totalRemainingAmount;
      
      // Generate monthly data for charts
      const maxMonths = Math.max(originalTimeInMonths, newPlanTimeInMonths);
      const monthlyData = Array.from({ length: maxMonths }, (_, i) => {
        const month = i + 1;
        let originalAmount = 0;
        let newPlanAmount = 0;
        
        // Calculate remaining balance for each month
        if (month <= originalTimeInMonths) {
          if (calculationMethod === InterestCalculationMethod.REDUCING_BALANCE) {
            // For reducing balance, calculate remaining principal
            const remainingMonths = originalTimeInMonths - month;
            originalAmount = calculateRemainingDebtReducingBalance(
              minMonthlyPayment, avgInterestRate, remainingMonths
            );
          } else {
            // For fixed interest, calculate linearly
            originalAmount = totalRemainingAmount * (1 - month / originalTimeInMonths);
          }
        }
        
        if (month <= newPlanTimeInMonths) {
          if (calculationMethod === InterestCalculationMethod.REDUCING_BALANCE) {
            // For reducing balance, calculate remaining principal
            const remainingMonths = newPlanTimeInMonths - month;
            newPlanAmount = calculateRemainingDebtReducingBalance(
              recommendedMonthlyPayment, avgInterestRate, remainingMonths
            );
          } else {
            // For fixed interest, calculate linearly
            newPlanAmount = totalRemainingAmount * (1 - month / newPlanTimeInMonths);
          }
        }
        
        // Ensure non-negative values
        originalAmount = Math.max(0, originalAmount);
        newPlanAmount = Math.max(0, newPlanAmount);
        
        return {
          month,
          originalAmount,
          newPlanAmount
        };
      });
      
      // Create the debt plan data
      result[debtTypeId] = {
        id: debtTypeId,
        label: debtTypeLabel,
        originalTotalAmount: totalRemainingAmount,
        newPlanTotalAmount: totalRemainingAmount,
        originalTimeInMonths,
        newPlanTimeInMonths,
        originalInterest,
        newPlanInterest,
        monthlyData
      };
    });
    
    // If no data was processed, return sample data
    return Object.keys(result).length > 0 ? result : SAMPLE_DEBT_DATA;
  };

  // Generate chart data based on the actual debt data
  const generateRealChartData = (debtTypeId: string) => {
    const data = syncedDebtData[debtTypeId] || syncedDebtData['total'];

    return {
      labels: data.monthlyData.map(item => item.month.toString()),
      datasets: [
        {
          label: 'แผนเดิม',
          data: data.monthlyData.map(item => item.originalAmount),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'แผนใหม่',
          data: data.monthlyData.map(item => item.newPlanAmount),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Generate bar chart data for debt by type
  const generateBarChartData = () => {
    // Get each debt type except 'total'
    const debtTypes = Object.values(syncedDebtData).filter(debt => debt.id !== 'total');

    return {
      labels: debtTypes.map(debt => debt.label),
      datasets: [
        {
          label: 'แผนเดิม',
          data: debtTypes.map(debt => debt.originalTotalAmount),
          backgroundColor: '#F59E0B',
        },
        {
          label: 'แผนใหม่',
          data: debtTypes.map(debt => debt.newPlanTotalAmount),
          backgroundColor: '#3B82F6',
        },
      ],
    };
  };

  // Fetch debt data on component mount
  useEffect(() => {
    fetchDebtData();
  }, [fetchDebtData]);

  // Notify parent component when debt type changes
  useEffect(() => {
    const currentData = syncedDebtData[currentDebtType.id] || syncedDebtData['total'];

    if (onDebtTypeChange) {
      onDebtTypeChange(
        currentDebtType.id,
        currentData.newPlanTimeInMonths,
        currentData.newPlanInterest
      );
    }
  }, [currentDebtTypeIndex, syncedDebtData, currentDebtType.id, onDebtTypeChange]);
  
  // Update debt calculations when calculation method changes
  useEffect(() => {
    if (debtData && debtData.length > 0) {
      const processedData = processDebtData(debtData);
      setSyncedDebtData(processedData);
    }
  }, [calculationMethod, debtData]);

  // Handle navigation to next debt type
  const handleNextDebtType = () => {
    goToNextDebtType();
    // You could add smooth scrolling logic here if needed
  };

  // Handle navigation to previous debt type
  const handlePrevDebtType = () => {
    goToPrevDebtType();
    // You could add smooth scrolling logic here if needed
  };

  return (
    <div>
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

      {/* Debt Type Selection with Swipe Navigation */}
      {/* <div className="flex justify-between items-center mb-4">
        <button
          aria-label="ประเภทหนี้ก่อนหน้า"
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={handlePrevDebtType}
        >
          <FiArrowLeft />
        </button>

        <h3 className="text-center font-medium">
          {currentDebtType.label}
        </h3>

        <button
          aria-label="ประเภทหนี้ถัดไป"
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={handleNextDebtType}
        >
          <FiArrowRight />
        </button>
      </div> */}

      {/* Calculation Method Selector */}
      <div className="mb-4">
        <div className="block text-sm font-medium text-gray-700 mb-1">วิธีคำนวณดอกเบี้ย</div>
        <div className="flex gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name="calculationMethod"
              value={InterestCalculationMethod.REDUCING_BALANCE}
              checked={calculationMethod === InterestCalculationMethod.REDUCING_BALANCE}
              onChange={() => setCalculationMethod(InterestCalculationMethod.REDUCING_BALANCE)}
            />
            <span className="ml-2">ลดต้นลดดอก</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name="calculationMethod"
              value={InterestCalculationMethod.FIXED_INTEREST}
              checked={calculationMethod === InterestCalculationMethod.FIXED_INTEREST}
              onChange={() => setCalculationMethod(InterestCalculationMethod.FIXED_INTEREST)}
            />
            <span className="ml-2">คงที่</span>
          </label>
        </div>
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
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="h-64 border border-gray-200 rounded-lg p-2">
            {activeTab === "ยอดหนี้รวม" ? (
            <Line
              data={generateRealChartData(currentDebtType.id)}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "ยอดหนี้ (บาท)",
                    },
                    ticks: {
                      callback: function (value: string | number) {
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
              }}
            />
          ) : (
            <Bar
              data={generateBarChartData()}
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
                      callback: function (value: string | number) {
                        return typeof value === "number"
                          ? value.toLocaleString("th-TH")
                          : value;
                      },
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "ประเภทหนี้",
                    },
                  },
                },
                plugins: chartOptions.plugins,
              }}
            />
          )}
          </div>
        )}
      </div>

      {/* Pagination Dots for Debt Type Navigation */}
      {/* <div className="flex justify-center gap-1 mb-4">
        {DEBT_TYPES.map((type, index) => (
          <div
            key={type.id}
            className={`w-2 h-2 rounded-full ${index === currentDebtTypeIndex ? "bg-blue-500" : "bg-gray-300"}`}
            role="button"
            tabIndex={0}
            onClick={() => setCurrentDebtTypeIndex(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentDebtTypeIndex(index);
              }
            }}
            style={{ cursor: 'pointer' }}
            aria-label={`Select ${type.label} debt type`}
          />
        ))}
      </div> */}
    </div>
  );
}
