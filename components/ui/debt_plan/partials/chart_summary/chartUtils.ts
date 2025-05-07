import { DebtItem } from '../../../types';

// Define DebtPlanData interface if the import is not working
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
import {
  calculateTimeToPayOffReducingBalance,
  calculateTimeToPayOffFixedInterest,
  calculateRemainingDebtReducingBalance,
  InterestCalculationMethod,
} from '../../utils/debtPlanUtils';

// Process debt data from API and organize it by debt type
export const processDebtData = (debtData: DebtItem[]) => {
  // Initialize result object for all debt types
  const result: Record<string, DebtPlanData> = {
    total: {
      id: "total",
      label: "ยอดหนี้รวม",
      originalTotalAmount: 0,
      newPlanTotalAmount: 0,
      originalTimeInMonths: 0,
      newPlanTimeInMonths: 0,
      originalInterest: 0,
      newPlanInterest: 0,
      monthlyData: [],
    }
  };

  // Group debts by type
  const groupedDebts: Record<string, DebtItem[]> = {};
  let totalOriginalAmount = 0;
  let totalNewPlanAmount = 0;
  let totalOriginalInterest = 0;
  let totalNewPlanInterest = 0;
  
  // Add all debts to appropriate groups
  debtData.forEach(debt => {
    // Convert debtType to key format (lowercase with underscores)
    const debtTypeKey = debt.debtType.toLowerCase().replace(/\s+/g, '_');
    
    if (!groupedDebts[debtTypeKey]) {
      groupedDebts[debtTypeKey] = [];
    }
    
    groupedDebts[debtTypeKey].push(debt);
    
    // Add to totals
    totalOriginalAmount += debt.remainingAmount;
    // Using 95% of original for new plan (simplified for demo)
    totalNewPlanAmount += debt.remainingAmount * 0.95;
  });
  
  // Process each debt group
  Object.entries(groupedDebts).forEach(([debtType, debts]) => {
    // Skip processing if no debts in this group
    if (debts.length === 0) return;
    
    // Calculate group totals
    const groupTotalAmount = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const groupNewPlanAmount = groupTotalAmount * 0.95; // Simplified: 5% reduction for new plan
    
    // Calculate minimum monthly payment (sum of all minimum payments, or 5% of debt if not specified)
    const groupMinMonthlyPayment = debts.reduce((sum, debt) => {
      return sum + (debt.minimumPayment || Math.ceil(debt.remainingAmount * 0.05));
    }, 0);
    
    // Calculate recommended monthly payment (10% higher than minimum)
    const groupRecommendedPayment = Math.ceil(groupMinMonthlyPayment * 1.1);
    
    // Calculate time to pay off for original plan (using minimum payment)
    let originalTimeInMonths = 0;
    let originalInterest = 0;
    
    // Calculate time to pay off for new plan (using recommended payment)
    let newPlanTimeInMonths = 0;
    let newPlanInterest = 0;
    
    // Process each debt in the group to calculate time and interest
    debts.forEach(debt => {
      const interestMethod = debt.interestRate >= 10 
        ? InterestCalculationMethod.REDUCING_BALANCE
        : InterestCalculationMethod.FIXED_INTEREST;
        
      const minPayment = debt.minimumPayment || Math.ceil(debt.remainingAmount * 0.05);
      
      // Original plan calculations
      if (interestMethod === InterestCalculationMethod.REDUCING_BALANCE) {
        const timeForThisDebt = calculateTimeToPayOffReducingBalance(
          debt.remainingAmount,
          debt.interestRate / 100, // Convert percentage to decimal
          minPayment
        );
        
        originalTimeInMonths = Math.max(originalTimeInMonths, timeForThisDebt);
        
        // Calculate interest for this debt
        let remainingAmount = debt.remainingAmount;
        let interestPaid = 0;
        
        for (let month = 1; month <= timeForThisDebt; month++) {
          const monthlyInterest = remainingAmount * (debt.interestRate / 100 / 12);
          interestPaid += monthlyInterest;
          
          const principalPayment = Math.min(minPayment - monthlyInterest, remainingAmount);
          remainingAmount -= principalPayment;
          
          if (remainingAmount <= 0) break;
        }
        
        originalInterest += interestPaid;
      } else {
        // Fixed interest calculation
        const timeForThisDebt = calculateTimeToPayOffFixedInterest(
          debt.remainingAmount,
          debt.interestRate / 100, // Convert percentage to decimal
          minPayment
        );
        
        originalTimeInMonths = Math.max(originalTimeInMonths, timeForThisDebt);
        
        // Calculate total interest (simplified for fixed interest)
        originalInterest += (debt.remainingAmount * (debt.interestRate / 100) * (timeForThisDebt / 12));
      }
      
      // New plan calculations (using 10% higher payment)
      const recommendedPayment = Math.ceil(minPayment * 1.1);
      
      if (interestMethod === InterestCalculationMethod.REDUCING_BALANCE) {
        const timeForThisDebt = calculateTimeToPayOffReducingBalance(
          debt.remainingAmount,
          (debt.interestRate * 0.95) / 100, // 5% lower interest rate for new plan
          recommendedPayment
        );
        
        newPlanTimeInMonths = Math.max(newPlanTimeInMonths, timeForThisDebt);
        
        // Calculate interest for this debt with new plan
        let remainingAmount = debt.remainingAmount;
        let interestPaid = 0;
        
        for (let month = 1; month <= timeForThisDebt; month++) {
          const monthlyInterest = remainingAmount * ((debt.interestRate * 0.95) / 100 / 12);
          interestPaid += monthlyInterest;
          
          const principalPayment = Math.min(recommendedPayment - monthlyInterest, remainingAmount);
          remainingAmount -= principalPayment;
          
          if (remainingAmount <= 0) break;
        }
        
        newPlanInterest += interestPaid;
      } else {
        // Fixed interest calculation for new plan
        const timeForThisDebt = calculateTimeToPayOffFixedInterest(
          debt.remainingAmount,
          (debt.interestRate * 0.95) / 100, // 5% lower interest rate for new plan
          recommendedPayment
        );
        
        newPlanTimeInMonths = Math.max(newPlanTimeInMonths, timeForThisDebt);
        
        // Calculate total interest for new plan (simplified for fixed interest)
        newPlanInterest += (debt.remainingAmount * ((debt.interestRate * 0.95) / 100) * (timeForThisDebt / 12));
      }
    });
    
    // Generate monthly data for charts
    const maxMonths = Math.max(originalTimeInMonths, newPlanTimeInMonths);
    const monthlyData = Array.from({ length: maxMonths }, (_, i) => {
      const month = i + 1;
      
      // Calculate remaining debt for each month
      let originalAmountForMonth = 0;
      let newPlanAmountForMonth = 0;
      
      debts.forEach(debt => {
        const interestMethod = debt.interestRate >= 10 
          ? InterestCalculationMethod.REDUCING_BALANCE
          : InterestCalculationMethod.FIXED_INTEREST;
          
        const minPayment = debt.minimumPayment || Math.ceil(debt.remainingAmount * 0.05);
        const recommendedPayment = Math.ceil(minPayment * 1.1);
        
        if (interestMethod === InterestCalculationMethod.REDUCING_BALANCE) {
          if (month <= originalTimeInMonths) {
            // Calculate remaining balance for this month - adjust parameters to match function signature
            originalAmountForMonth += debt.remainingAmount * 
              Math.pow(1 + (debt.interestRate / 100 / 12), month) - 
              (minPayment * ((Math.pow(1 + (debt.interestRate / 100 / 12), month) - 1) / 
              (debt.interestRate / 100 / 12)));
          }
          
          if (month <= newPlanTimeInMonths) {
            // Calculate remaining balance for new plan - adjust parameters to match function signature
            newPlanAmountForMonth += debt.remainingAmount * 
              Math.pow(1 + ((debt.interestRate * 0.95) / 100 / 12), month) - 
              (recommendedPayment * ((Math.pow(1 + ((debt.interestRate * 0.95) / 100 / 12), month) - 1) / 
              ((debt.interestRate * 0.95) / 100 / 12)));
          }
        } else {
          // Simplified linear reduction for fixed interest
          if (month <= originalTimeInMonths) {
            originalAmountForMonth += Math.max(0, debt.remainingAmount * (1 - month / originalTimeInMonths));
          }
          
          if (month <= newPlanTimeInMonths) {
            newPlanAmountForMonth += Math.max(0, debt.remainingAmount * (1 - month / newPlanTimeInMonths));
          }
        }
      });
      
      return {
        month,
        originalAmount: Math.max(0, originalAmountForMonth),
        newPlanAmount: Math.max(0, newPlanAmountForMonth),
      };
    });
    
    // Add to result object
    result[debtType] = {
      id: debtType,
      label: getDebtTypeLabel(debtType),
      originalTotalAmount: groupTotalAmount,
      newPlanTotalAmount: groupNewPlanAmount,
      originalTimeInMonths,
      newPlanTimeInMonths,
      originalInterest,
      newPlanInterest,
      monthlyData,
    };
    
    // Add to total calculations
    result.total.originalTimeInMonths = Math.max(result.total.originalTimeInMonths, originalTimeInMonths);
    result.total.newPlanTimeInMonths = Math.max(result.total.newPlanTimeInMonths, newPlanTimeInMonths);
    totalOriginalInterest += originalInterest;
    totalNewPlanInterest += newPlanInterest;
  });
  
  // Update total amounts and interest
  result.total.originalTotalAmount = totalOriginalAmount;
  result.total.newPlanTotalAmount = totalNewPlanAmount;
  result.total.originalInterest = totalOriginalInterest;
  result.total.newPlanInterest = totalNewPlanInterest;
  
  // Generate monthly data for total
  const maxTotalMonths = Math.max(result.total.originalTimeInMonths, result.total.newPlanTimeInMonths);
  result.total.monthlyData = Array.from({ length: maxTotalMonths }, (_, i) => {
    const month = i + 1;
    
    // Sum up amounts from all debt types for this month
    let totalOriginalAmount = 0;
    let totalNewPlanAmount = 0;
    
    Object.entries(result).forEach(([type, data]) => {
      if (type === 'total') return; // Skip total to avoid circular reference
      
      const monthData = data.monthlyData.find((m: {month: number}) => m.month === month);
      if (monthData) {
        totalOriginalAmount += monthData.originalAmount;
        totalNewPlanAmount += monthData.newPlanAmount;
      }
    });
    
    return {
      month,
      originalAmount: totalOriginalAmount,
      newPlanAmount: totalNewPlanAmount,
    };
  });
  
  return result;
};

// Generate chart data for line charts
export const generateLineChartData = (debtTypeData: DebtPlanData) => {
  // Get the monthly data from the debt data
  const monthlyData = debtTypeData.monthlyData || [];
  
  // Make sure we have valid time periods - default to 12 months if zero
  const originalTimeInMonths = debtTypeData.originalTimeInMonths || 12;
  const newPlanTimeInMonths = debtTypeData.newPlanTimeInMonths || 12;
  
  // Make sure we have valid total amounts
  const originalTotalAmount = debtTypeData.originalTotalAmount || 100000;
  const newPlanTotalAmount = debtTypeData.newPlanTotalAmount || 90000;
  
  // Get maximum months to show on chart, ensure at least 12 months
  const maxMonths = Math.max(originalTimeInMonths, newPlanTimeInMonths, 12);
  
  // Generate sample data points if no data is provided
  if (monthlyData.length === 0) {
    for (let i = 0; i < maxMonths; i++) {
      const month = i + 1;
      const originalMonthlyRate = originalTotalAmount / originalTimeInMonths;
      const newPlanMonthlyRate = newPlanTotalAmount / newPlanTimeInMonths;
      
      monthlyData.push({
        month,
        originalAmount: Math.max(0, originalTotalAmount - (originalMonthlyRate * month)),
        newPlanAmount: Math.max(0, newPlanTotalAmount - (newPlanMonthlyRate * month))
      });
    }
  }
  
  // Ensure we have enough data points for visualization
  const completeMonthlyData = Array.from({ length: maxMonths }, (_, i) => {
    const month = i + 1;
    const existingData = monthlyData.find((data: {month: number}) => data.month === month);
    
    if (existingData) {
      return existingData;
    } else {
      // Use linear projection for missing months
      return {
        month,
        originalAmount: month <= originalTimeInMonths ?
          Math.max(0, originalTotalAmount * (1 - month / originalTimeInMonths)) : 0,
        newPlanAmount: month <= newPlanTimeInMonths ?
          Math.max(0, newPlanTotalAmount * (1 - month / newPlanTimeInMonths)) : 0,
      };
    }
  });
  
  // Make sure we have at least two points for each dataset to avoid line chart errors
  if (completeMonthlyData.length < 2) {
    completeMonthlyData.push(
      { month: 1, originalAmount: originalTotalAmount, newPlanAmount: newPlanTotalAmount },
      { month: maxMonths, originalAmount: 0, newPlanAmount: 0 }
    );
  }
  
  return {
    labels: completeMonthlyData.map(data => `เดือน ${data.month}`),
    datasets: [
      {
        label: "แผนเดิม",
        data: completeMonthlyData.map(data => data.originalAmount),
        borderColor: "#F59E0B", // Warmer orange for original plan
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#F59E0B",
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "แผนใหม่",
        data: completeMonthlyData.map(data => data.newPlanAmount),
        borderColor: "#3B82F6", // Cooler blue for new plan
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.4, 
        pointBackgroundColor: "#3B82F6",
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };
};

// Generate chart data for bar charts
export const generateBarChartData = (debtDataByType: Record<string, DebtPlanData>) => {
  // Filter out the "total" entry
  const filteredData = Object.entries(debtDataByType).filter(
    ([key]) => key !== "total"
  );
  
  return {
    labels: filteredData.map(([_, data]) => data.label),
    datasets: [
      {
        label: "แผนเดิม",
        data: filteredData.map(([_, data]) => data.originalTotalAmount),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
      },
      {
        label: "แผนใหม่",
        data: filteredData.map(([_, data]) => data.newPlanTotalAmount),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
      },
    ],
  };
};

// Helper function to get Thai labels for debt types
export const getDebtTypeLabel = (debtType: string): string => {
  const labelMap: Record<string, string> = {
    total: "ยอดหนี้รวม",
    credit_card: "บัตรเครดิต",
    personal_loan: "สินเชื่อส่วนบุคคล",
    auto_loan: "สินเชื่อรถยนต์",
    mortgage: "สินเชื่อบ้าน",
    education_loan: "สินเชื่อการศึกษา",
    other: "หนี้อื่นๆ",
  };

  return labelMap[debtType] || debtType;
};
