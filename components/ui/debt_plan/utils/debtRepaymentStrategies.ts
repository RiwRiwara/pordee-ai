import { DebtItem } from "../../types";

/**
 * Debt Repayment Strategies Implementation
 *
 * This file contains implementations of different debt repayment strategies:
 * 1. Lowest Balance First (Snowball)
 * 2. Highest Interest First (Avalanche)
 * 3. Priority Score
 * 4. Proportional Payment
 */

// Define repayment strategy types
export type RepaymentStrategy =
  | "Snowball"
  | "Avalanche"
  | "PriorityScore"
  | "Proportional";

// Strategy descriptions for UI display
export const STRATEGY_DESCRIPTIONS: Record<RepaymentStrategy, string> = {
  Snowball: "เริ่มจากหนี้ก้อนเล็กไปหาก้อนใหญ่",
  Avalanche: "เริ่มจากหนี้ดอกเบี้ยสูงสุดก่อน",
  PriorityScore: "จัดลำดับตามคะแนนความสำคัญ",
  Proportional: "กระจายการชำระอย่างสมดุล",
};

// Strategy to Thai name mapping
export const STRATEGY_NAMES: Record<RepaymentStrategy, string> = {
  Snowball: "เห็นผลเร็ว",
  Avalanche: "ประหยัดดอกเบี้ย",
  PriorityScore: "ตามลำดับความสำคัญ",
  Proportional: "สมดุล",
};

/**
 * Calculate Priority Score for a debt
 * Priority Score = (Interest × 0.4) + (Overdue × 0.3) + (Minpay × 0.2) + (Balance × 0.1)
 * where values are normalized
 */
export const calculatePriorityScore = (
  debts: DebtItem[],
  debt: DebtItem,
): number => {
  if (!debts.length) return 0;

  // Extract values for normalization
  const interestRates = debts.map((d) => d.interestRate);
  const minPayments = debts.map(
    (d) => d.minimumPayment || Math.max(d.remainingAmount * 0.01, 500),
  );
  const balances = debts.map((d) => d.remainingAmount);

  // Find min and max values for normalization
  const minInterest = Math.min(...interestRates);
  const maxInterest = Math.max(...interestRates);
  const minPayment = Math.min(...minPayments);
  const maxPayment = Math.max(...minPayments);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);

  // Normalize values (prevent division by zero)
  const normalizeInterest =
    maxInterest > minInterest
      ? (debt.interestRate - minInterest) / (maxInterest - minInterest)
      : 1;

  const normalizeMinPay =
    maxPayment > minPayment
      ? ((debt.minimumPayment || Math.max(debt.remainingAmount * 0.01, 500)) -
          minPayment) /
        (maxPayment - minPayment)
      : 1;

  const normalizeBalance =
    maxBalance > minBalance
      ? (debt.remainingAmount - minBalance) / (maxBalance - minBalance)
      : 1;

  // Check if debt is overdue (using paymentDueDay as a proxy - if it's in the past)
  // This is a simplified approach - in a real app, you'd have actual overdue status
  const currentDay = new Date().getDate();
  const isOverdue = debt.paymentDueDay
    ? debt.paymentDueDay < currentDay
    : false;
  const overdueValue = isOverdue ? 1 : 0;

  // Calculate priority score
  return (
    normalizeInterest * 0.4 +
    overdueValue * 0.3 +
    normalizeMinPay * 0.2 +
    normalizeBalance * 0.1
  );
};

/**
 * Sort debts according to the selected repayment strategy
 * @param debts Array of debt items to sort
 * @param strategy Repayment strategy to use for sorting
 * @returns Sorted array of debt items
 */
export const sortDebtsByStrategy = (
  debts: DebtItem[],
  strategy: RepaymentStrategy,
): DebtItem[] => {
  if (!debts.length) return [];

  // Clone debts to avoid modifying originals
  const debtsCopy = JSON.parse(JSON.stringify(debts));

  if (strategy === "Snowball") {
    // Option 1: Lowest Balance First (Snowball)
    // Sort debts by balance (lowest to highest)
    return debtsCopy.sort(
      (a: DebtItem, b: DebtItem) => a.remainingAmount - b.remainingAmount,
    );
  } else if (strategy === "Avalanche") {
    // Option 2: Highest Interest First (Avalanche)
    // Sort debts by interest rate (highest to lowest)
    return debtsCopy.sort(
      (a: DebtItem, b: DebtItem) => b.interestRate - a.interestRate,
    );
  } else if (strategy === "PriorityScore") {
    // Option 3: Priority Score
    // Calculate priority scores for each debt
    const priorityScores = new Map<string, number>();

    for (const debt of debtsCopy) {
      const score = calculatePriorityScore(debts, debt);

      priorityScores.set(debt._id, score);
    }

    // Sort by priority score (highest first)
    return debtsCopy.sort((a: DebtItem, b: DebtItem) => {
      const scoreA = priorityScores.get(a._id) || 0;
      const scoreB = priorityScores.get(b._id) || 0;

      return scoreB - scoreA;
    });
  }

  // For Proportional strategy, return unsorted (order doesn't matter)
  return debtsCopy;
};

/**
 * Apply payment to debts according to the selected repayment strategy
 * @param debts Array of debt items
 * @param totalPayment Total payment amount to distribute
 * @param strategy Repayment strategy to use
 * @returns Updated array of debt items after payment
 */
export const applyPaymentWithStrategy = (
  debts: DebtItem[],
  totalPayment: number,
  strategy: RepaymentStrategy,
): DebtItem[] => {
  if (!debts.length || totalPayment <= 0) return debts;

  // Clone debts to avoid modifying originals
  const debtsCopy = JSON.parse(JSON.stringify(debts));

  // Calculate total minimum payment
  const totalMinimumPayment = debtsCopy.reduce(
    (sum: number, debt: DebtItem) => {
      const minPayment =
        debt.minimumPayment || Math.max(debt.remainingAmount * 0.01, 500);

      return sum + Math.min(minPayment, debt.remainingAmount);
    },
    0,
  );

  // Ensure payment is at least the total minimum payment
  const adjustedPayment = Math.max(totalPayment, totalMinimumPayment);

  // First, pay minimum payments on all debts
  for (const debt of debtsCopy) {
    const minPayment =
      debt.minimumPayment || Math.max(debt.remainingAmount * 0.01, 500);
    const actualMinPayment = Math.min(minPayment, debt.remainingAmount);

    debt.remainingAmount = Math.max(0, debt.remainingAmount - actualMinPayment);
  }

  // Calculate extra payment after minimum payments
  let extraPayment = adjustedPayment - totalMinimumPayment;

  // Remove fully paid debts
  let remainingDebts = debtsCopy.filter(
    (debt: DebtItem) => debt.remainingAmount > 0.01,
  );

  if (extraPayment > 0 && remainingDebts.length > 0) {
    if (strategy === "Proportional") {
      // Option 4: Proportional Payment
      // Distribute extra payment proportionally based on remaining balance
      const totalRemainingAmount = remainingDebts.reduce(
        (sum: number, debt: DebtItem) => sum + debt.remainingAmount,
        0,
      );

      for (const debt of remainingDebts) {
        const proportion = debt.remainingAmount / totalRemainingAmount;
        const proportionalPayment = extraPayment * proportion;

        debt.remainingAmount = Math.max(
          0,
          debt.remainingAmount - proportionalPayment,
        );
      }
    } else {
      // For Snowball, Avalanche, and PriorityScore strategies
      // Sort debts according to strategy
      remainingDebts = sortDebtsByStrategy(remainingDebts, strategy);

      // Apply extra payment to the first debt in the sorted list
      const firstDebt = remainingDebts[0];
      const paymentToApply = Math.min(extraPayment, firstDebt.remainingAmount);

      firstDebt.remainingAmount = Math.max(
        0,
        firstDebt.remainingAmount - paymentToApply,
      );
    }
  }

  return debtsCopy;
};

/**
 * Simulate debt repayment over time using the selected strategy
 * @param debts Array of debt items
 * @param monthlyPayment Monthly payment amount
 * @param strategy Repayment strategy to use
 * @param maxMonths Maximum number of months to simulate
 * @returns Object containing months to debt-free and total interest paid
 */
export const simulateDebtRepayment = (
  debts: DebtItem[],
  monthlyPayment: number,
  strategy: RepaymentStrategy,
  maxMonths: number = 360, // 30 years default max
): { monthsToDebtFree: number; totalInterestPaid: number } => {
  if (!debts.length || monthlyPayment <= 0) {
    return { monthsToDebtFree: 0, totalInterestPaid: 0 };
  }

  // Clone debts to avoid modifying originals
  let debtsCopy = JSON.parse(JSON.stringify(debts));

  let months = 0;
  let totalInterestPaid = 0;

  while (debtsCopy.length > 0 && months < maxMonths) {
    months++;

    // Calculate interest for all debts
    for (const debt of debtsCopy) {
      const monthlyInterest =
        debt.remainingAmount * (debt.interestRate / 100 / 12);

      debt.remainingAmount += monthlyInterest;
      totalInterestPaid += monthlyInterest;
    }

    // Apply payment according to strategy
    debtsCopy = applyPaymentWithStrategy(debtsCopy, monthlyPayment, strategy);

    // Remove fully paid debts
    debtsCopy = debtsCopy.filter(
      (debt: DebtItem) => debt.remainingAmount > 0.01,
    );
  }

  return {
    monthsToDebtFree: Math.min(months, maxMonths),
    totalInterestPaid: Math.round(totalInterestPaid),
  };
};
