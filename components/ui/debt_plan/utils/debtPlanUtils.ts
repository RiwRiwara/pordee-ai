import { DebtItem } from "../../types";

// Interface for debt plan data
export interface DebtPlanData {
  months: number[];
  originalPlan: number[];
  newPlan: number[];
}

// Calculation methods enum
export enum InterestCalculationMethod {
  REDUCING_BALANCE = "reducing_balance",
  FIXED_INTEREST = "fixed_interest"
}

// Define debt types
export const DEBT_TYPES = [
  { id: "all", label: "ทั้งหมด" },
  { id: "personal", label: "สินเชื่อส่วนบุคคล" },
  { id: "credit_card", label: "บัตรเครดิต" },
  { id: "car", label: "สินเชื่อรถยนต์" },
  { id: "home", label: "สินเชื่อบ้าน" },
  { id: "business", label: "สินเชื่อธุรกิจ" },
  { id: "other", label: "อื่นๆ" },
];

// Format numbers with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Filter debts by debt type ID
export const filterDebtsByType = (
  debts: DebtItem[],
  debtTypeId: string,
): DebtItem[] => {
  if (!debts || debts.length === 0) return [];
  if (debtTypeId === "all") return debts;

  return debts.filter(
    (debt) => mapDebtTypeToCategory(debt.debtType) === debtTypeId,
  );
};

// Map debt type to a category for filtering
export const mapDebtTypeToCategory = (debtType: string): string => {
  // Map debtType to categories used in DEBT_TYPES
  if (debtType === "หนี้สินหมุนเวียน" || debtType === "บัตรเครดิต")
    return "credit_card";
  if (debtType === "สินเชื่อที่อยู่อาศัย" || debtType === "สินเชื่อบ้าน")
    return "home";
  if (debtType === "สินเชื่อยานพาหนะ" || debtType === "สินเชื่อรถยนต์")
    return "car";
  if (debtType === "สินเชื่อส่วนบุคคล") return "personal";
  if (debtType === "สินเชื่อธุรกิจ") return "business";
  if (debtType === "เงินกู้นอกระบบ") return "other";
  if (debtType === "หนี้สินผ่อนสินค้า") return "other"; // Product installment

  return "other";
};

// Calculate minimum total monthly payment needed for all debts
export const calculateMinimumMonthlyPayment = (debts: DebtItem[]): number => {
  return debts.reduce((sum, debt) => {
    // Use minimumPayment if available, otherwise calculate as 1-3% of balance
    const minPayment =
      debt.minimumPayment || Math.max(debt.remainingAmount * 0.01, 500);

    return sum + minPayment;
  }, 0);
};

// Calculate total remaining debt amount
export const calculateTotalRemainingDebt = (debts: DebtItem[]): number => {
  return debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
};

// Calculate recommended payment for debt-free in X months
export const calculateRecommendedPayment = (
  debts: DebtItem[],
  targetMonths: number,
): number => {
  const totalDebt = calculateTotalRemainingDebt(debts);
  // Add 15% for interest over the period (simplified estimation)
  const totalWithInterest = totalDebt * 1.15;

  return Math.ceil(totalWithInterest / targetMonths);
};

/**
 * Calculate time to pay off debt using reducing balance interest formula
 * T = log(P / (P - D0 × r)) / log(1 + r)
 * where:
 * - T = time in months
 * - D0 = principal (initial debt)
 * - r = monthly interest rate (annual rate / 12 / 100)
 * - P = monthly payment
 */
export const calculateTimeToPayOffReducingBalance = (
  principal: number,
  annualInterestRate: number,
  monthlyPayment: number
): number => {
  // Convert annual interest rate to monthly decimal
  const r = annualInterestRate / 12 / 100;
  
  // Ensure payment is greater than monthly interest
  if (monthlyPayment <= principal * r) {
    return Infinity; // Payment too small to ever pay off debt
  }
  
  // Calculate time to pay off
  const numerator = Math.log(monthlyPayment / (monthlyPayment - principal * r));
  const denominator = Math.log(1 + r);
  
  return Math.ceil(numerator / denominator);
};

/**
 * Calculate time to pay off debt using fixed interest formula
 * T = D0 / (P - D0 × r)
 * where:
 * - T = time in months
 * - D0 = principal (initial debt)
 * - r = monthly interest rate (annual rate / 12 / 100)
 * - P = monthly payment
 */
export const calculateTimeToPayOffFixedInterest = (
  principal: number,
  annualInterestRate: number,
  monthlyPayment: number
): number => {
  // Convert annual interest rate to monthly decimal
  const r = annualInterestRate / 12 / 100;
  
  // Ensure payment is greater than monthly interest
  if (monthlyPayment <= principal * r) {
    return Infinity; // Payment too small to ever pay off debt
  }
  
  // Calculate time to pay off
  return Math.ceil(principal / (monthlyPayment - principal * r));
};

/**
 * Calculate remaining debt using reducing balance interest formula
 * D0 = P × (1 - (1 + r)^(-n)) / r
 * where:
 * - D0 = remaining debt
 * - P = monthly payment
 * - r = monthly interest rate (annual rate / 12 / 100)
 * - n = number of months
 */
export const calculateRemainingDebtReducingBalance = (
  monthlyPayment: number,
  annualInterestRate: number,
  months: number
): number => {
  // Convert annual interest rate to monthly decimal
  const r = annualInterestRate / 12 / 100;
  
  // Calculate remaining debt
  return monthlyPayment * (1 - Math.pow(1 + r, -months)) / r;
};

/**
 * Calculate remaining debt using fixed interest formula
 * D0 = P × T / (1 + (r × T))
 * where:
 * - D0 = remaining debt
 * - P = monthly payment
 * - r = monthly interest rate (annual rate / 12 / 100)
 * - T = time in months
 */
export const calculateRemainingDebtFixedInterest = (
  monthlyPayment: number,
  annualInterestRate: number,
  months: number
): number => {
  // Convert annual interest rate to monthly decimal
  const r = annualInterestRate / 12 / 100;
  
  // Calculate remaining debt
  return monthlyPayment * months / (1 + (r * months));
};

// Calculate time to debt-free with a given monthly payment
// Define repayment strategy types
export type RepaymentStrategy = "Snowball" | "Avalanche" | "Proportional" | "PriorityScore";

/**
 * Calculate Priority Score for a debt
 * Priority Score = (Interest × 0.4) + (Overdue × 0.3) + (Minpay × 0.2) + (Balance × 0.1)
 * where values are normalized
 */
export const calculatePriorityScore = (debts: DebtItem[], debt: DebtItem): number => {
  if (!debts.length) return 0;
  
  // Extract values for normalization
  const interestRates = debts.map(d => d.interestRate);
  const minPayments = debts.map(d => d.minimumPayment || Math.max(d.remainingAmount * 0.01, 500));
  const balances = debts.map(d => d.remainingAmount);
  
  // Find min and max values for normalization
  const minInterest = Math.min(...interestRates);
  const maxInterest = Math.max(...interestRates);
  const minPayment = Math.min(...minPayments);
  const maxPayment = Math.max(...minPayments);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  
  // Normalize values (prevent division by zero)
  const normalizeInterest = maxInterest > minInterest ? 
    (debt.interestRate - minInterest) / (maxInterest - minInterest) : 1;
  
  const normalizeMinPay = maxPayment > minPayment ? 
    ((debt.minimumPayment || Math.max(debt.remainingAmount * 0.01, 500)) - minPayment) / (maxPayment - minPayment) : 1;
  
  const normalizeBalance = maxBalance > minBalance ? 
    (debt.remainingAmount - minBalance) / (maxBalance - minBalance) : 1;
  
  // Check if debt is overdue (using paymentDueDay as a proxy - if it's in the past)
  // This is a simplified approach - in a real app, you'd have actual overdue status
  const currentDay = new Date().getDate();
  const isOverdue = debt.paymentDueDay ? debt.paymentDueDay < currentDay : false;
  const overdueValue = isOverdue ? 1 : 0;
  
  // Calculate priority score
  return (
    normalizeInterest * 0.4 +
    overdueValue * 0.3 +
    normalizeMinPay * 0.2 +
    normalizeBalance * 0.1
  );
};

export const calculateMonthsToDebtFree = (
  debts: DebtItem[],
  monthlyPayment: number,
  strategy: RepaymentStrategy,
): number => {
  if (!debts.length) return 0;
  if (monthlyPayment <= 0) return Infinity;

  // Clone debts to avoid modifying originals
  let debtsCopy = JSON.parse(JSON.stringify(debts));

  // Calculate minimum payments
  const totalMinimumPayment = calculateMinimumMonthlyPayment(debtsCopy);

  // Adjust if monthly payment is less than total minimum payments
  const adjustedMonthlyPayment = Math.max(monthlyPayment, totalMinimumPayment);

  // Money left after minimum payments
  let extraPayment = adjustedMonthlyPayment - totalMinimumPayment;

  let months = 0;
  const MAX_MONTHS = 1200; // 100 years - safety limit

  while (debtsCopy.length > 0 && months < MAX_MONTHS) {
    months++;

    // Reorder debts according to strategy
    if (strategy === "Snowball") {
      // Snowball - focus on lowest balance first
      debtsCopy.sort(
        (a: DebtItem, b: DebtItem) => a.remainingAmount - b.remainingAmount,
      );
    } else {
      // Avalanche - focus on highest interest first
      debtsCopy.sort(
        (a: DebtItem, b: DebtItem) => b.interestRate - a.interestRate,
      );
    }

    // Track total minimum payment for this month (may change as debts are paid off)
    let currentMonthMinPayment = 0;

    // Apply minimum payments and calculate interest
    for (let i = 0; i < debtsCopy.length; i++) {
      const debt = debtsCopy[i];

      // Apply interest for this month (annual rate / 12)
      const monthlyInterest =
        debt.remainingAmount * (debt.interestRate / 100 / 12);

      debt.remainingAmount += monthlyInterest;

      // Apply minimum payment
      const minPayment =
        debt.minimumPayment || Math.max(debt.remainingAmount * 0.01, 500);
      // Don't pay more than the remaining amount
      const actualMinPayment = Math.min(minPayment, debt.remainingAmount);

      debt.remainingAmount = Math.max(
        0,
        debt.remainingAmount - actualMinPayment,
      );
      currentMonthMinPayment += actualMinPayment;
    }

    // Recalculate extra payment (may have changed if some debts were nearly paid off)
    extraPayment = Math.max(0, adjustedMonthlyPayment - currentMonthMinPayment);

    // Remove fully paid debts
    debtsCopy = debtsCopy.filter(
      (debt: DebtItem) => debt.remainingAmount > 0.01,
    ); // Use small threshold to handle floating point errors

    // Apply extra payment based on strategy
    if (extraPayment > 0 && debtsCopy.length > 0) {
      if (strategy === "Proportional") {
        // Proportional strategy: distribute extra payment proportionally based on balance
        const totalRemainingAmount = debtsCopy.reduce(
          (sum: number, debt: DebtItem) => sum + debt.remainingAmount, 0
        );
        
        // Distribute extra payment proportionally
        for (let i = 0; i < debtsCopy.length; i++) {
          const debt = debtsCopy[i];
          const proportion = debt.remainingAmount / totalRemainingAmount;
          const proportionalPayment = extraPayment * proportion;
          
          debt.remainingAmount = Math.max(0, debt.remainingAmount - proportionalPayment);
        }
      } else {
        // Snowball, Avalanche, or PriorityScore: focus on first debt in sorted list
        debtsCopy[0].remainingAmount = Math.max(
          0,
          debtsCopy[0].remainingAmount - extraPayment,
        );

        // Check if this debt is now paid off
        if (debtsCopy[0].remainingAmount < 0.01) {
          debtsCopy.shift(); // Remove the first debt if it's paid off
        }
      }
    }
  }

  return Math.min(months, MAX_MONTHS);
};

// Calculate total interest paid with a given payment strategy
export const calculateTotalInterestPaid = (
  debts: DebtItem[],
  monthlyPayment: number,
  strategy: RepaymentStrategy,
): number => {
  if (!debts.length) return 0;
  if (monthlyPayment <= 0) return Infinity;

  // Clone debts to avoid modifying originals
  let debtsCopy = JSON.parse(JSON.stringify(debts));
  const originalTotal = calculateTotalRemainingDebt(debts);

  // Calculate minimum payments
  const totalMinimumPayment = calculateMinimumMonthlyPayment(debtsCopy);

  // Adjust if monthly payment is less than total minimum payments
  const adjustedMonthlyPayment = Math.max(monthlyPayment, totalMinimumPayment);

  let months = 0;
  let totalPaid = 0;
  let totalInterestPaid = 0;
  const MAX_MONTHS = 1200; // 100 years - safety limit

  while (debtsCopy.length > 0 && months < MAX_MONTHS) {
    months++;

    // Track actual payment for this month (may be less than adjustedMonthlyPayment in final month)
    let actualMonthlyPayment = 0;

    // Reorder debts according to strategy
    if (strategy === "Snowball") {
      // Snowball - focus on lowest balance first
      debtsCopy.sort(
        (a: DebtItem, b: DebtItem) => a.remainingAmount - b.remainingAmount,
      );
    } else {
      // Avalanche - focus on highest interest first
      debtsCopy.sort(
        (a: DebtItem, b: DebtItem) => b.interestRate - a.interestRate,
      );
    }

    // Calculate interest for all debts first
    let totalMonthlyInterest = 0;

    for (let i = 0; i < debtsCopy.length; i++) {
      const debt = debtsCopy[i];

      // Apply interest for this month (annual rate / 12)
      const monthlyInterest =
        debt.remainingAmount * (debt.interestRate / 100 / 12);

      debt.remainingAmount += monthlyInterest;
      totalMonthlyInterest += monthlyInterest;
    }

    // Add interest to total interest paid
    totalInterestPaid += totalMonthlyInterest;

    // Calculate total minimum payment for this month
    let currentMonthMinPayment = 0;

    for (let i = 0; i < debtsCopy.length; i++) {
      const debt = debtsCopy[i];
      const minPayment =
        debt.minimumPayment || Math.max(debt.remainingAmount * 0.01, 500);
      // Don't pay more than the remaining amount
      const actualMinPayment = Math.min(minPayment, debt.remainingAmount);

      debt.remainingAmount = Math.max(
        0,
        debt.remainingAmount - actualMinPayment,
      );
      currentMonthMinPayment += actualMinPayment;
      actualMonthlyPayment += actualMinPayment;
    }

    // Money left after minimum payments
    let extraPayment = Math.min(
      adjustedMonthlyPayment - currentMonthMinPayment,
      debtsCopy.reduce(
        (sum: number, debt: DebtItem) => sum + debt.remainingAmount,
        0,
      ), // Don't pay more than total remaining
    );

    // Apply extra payment to first debt in the sorted list (following strategy)
    if (extraPayment > 0 && debtsCopy.length > 0) {
      const extraToApply = Math.min(extraPayment, debtsCopy[0].remainingAmount);

      debtsCopy[0].remainingAmount = Math.max(
        0,
        debtsCopy[0].remainingAmount - extraToApply,
      );
      actualMonthlyPayment += extraToApply;
    }

    // Add actual payment to total paid
    totalPaid += actualMonthlyPayment;

    // Remove fully paid debts
    debtsCopy = debtsCopy.filter(
      (debt: DebtItem) => debt.remainingAmount > 0.01,
    ); // Use small threshold for floating point errors
  }

  return Math.max(0, totalInterestPaid);
};
