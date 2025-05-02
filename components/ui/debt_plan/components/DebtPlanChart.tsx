import React from "react";
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
import { Line } from "react-chartjs-2";

import { DebtItem } from "../../types";

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

// Interface is imported from ../../types

interface DebtPlanChartProps {
  debts: DebtItem[];
  monthlyPayment: number;
  timeInMonths: number;
  paymentStrategy: string;
  originalMonthlyPayment: number;
  debtTypeId?: string;
}

export default function DebtPlanChart({
  debts,
  monthlyPayment,
  timeInMonths,
  paymentStrategy,
  originalMonthlyPayment,
  debtTypeId = "all",
}: DebtPlanChartProps) {
  // Filter debts by type if needed
  const filteredDebts =
    debtTypeId === "all"
      ? debts
      : debts.filter(
          (debt) => mapDebtTypeToCategory(debt.debtType) === debtTypeId,
        );

  // Calculate total remaining amount
  const totalDebt = filteredDebts.reduce(
    (sum, debt) => sum + debt.remainingAmount,
    0,
  );

  // Generate chart data based on real debt data
  const chartData = generateDebtPayoffChart(
    filteredDebts,
    monthlyPayment,
    timeInMonths,
    paymentStrategy,
    originalMonthlyPayment,
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (this: any, value: string | number) {
            if (typeof value === "number") {
              if (value >= 1000000) {
                return (value / 1000000).toLocaleString("th-TH") + "M";
              } else if (value >= 1000) {
                return (value / 1000).toLocaleString("th-TH") + "K";
              }

              return value.toLocaleString("th-TH");
            }

            return value;
          },
        },
      },
      x: {
        ticks: {
          maxTicksLimit: 12,
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";

            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("th-TH", {
                style: "currency",
                currency: "THB",
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }

            return label;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full relative">
      <Line data={chartData} options={options} />
    </div>
  );
}

// Map debt type to a category for filtering
function mapDebtTypeToCategory(debtType: string): string {
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

  return "other";
}

// Generate realistic debt payoff chart data
function generateDebtPayoffChart(
  debts: DebtItem[],
  monthlyPayment: number,
  timeInMonths: number,
  paymentStrategy: string,
  originalMonthlyPayment: number,
) {
  const months = Array.from(
    { length: Math.max(timeInMonths, 24) },
    (_, i) => i + 1,
  );

  // Clone debts to avoid modifying originals
  const originalDebts = JSON.parse(JSON.stringify(debts));
  const optimizedDebts = JSON.parse(JSON.stringify(debts));

  // Calculate debt payoff trajectory with original plan
  const originalPlanData = calculateDebtTrajectory(
    originalDebts,
    originalMonthlyPayment > 0 ? originalMonthlyPayment : monthlyPayment * 0.7,
    months.length,
    paymentStrategy === "Snowball" ? "lowest-balance" : "highest-interest",
  );

  // Calculate debt payoff trajectory with new plan
  const newPlanData = calculateDebtTrajectory(
    optimizedDebts,
    monthlyPayment,
    months.length,
    paymentStrategy === "Snowball" ? "lowest-balance" : "highest-interest",
  );

  return {
    labels: months.map((m) => m + " เดือน"),
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
}

// Calculate the month-by-month remaining debt with a payment strategy
function calculateDebtTrajectory(
  debts: DebtItem[],
  monthlyPayment: number,
  totalMonths: number,
  strategy: "lowest-balance" | "highest-interest",
): number[] {
  if (!debts.length) return Array(totalMonths).fill(0);

  const result: number[] = [];
  let currentDebts = [...debts];

  // Calculate minimum payments
  const totalMinimumPayment = currentDebts.reduce((sum, debt) => {
    // Use minimumPayment if available, otherwise calculate as 1-3% of balance
    const minPayment =
      debt.minimumPayment || Math.max(debt.remainingAmount * 0.01, 500);

    return sum + minPayment;
  }, 0);

  // Adjust if monthly payment is less than total minimum payments
  const adjustedMonthlyPayment = Math.max(monthlyPayment, totalMinimumPayment);

  // Money left after minimum payments
  let extraPayment = adjustedMonthlyPayment - totalMinimumPayment;

  for (let month = 0; month < totalMonths; month++) {
    // Reorder debts according to strategy
    if (strategy === "lowest-balance") {
      // Snowball - focus on lowest balance first
      currentDebts.sort((a, b) => a.remainingAmount - b.remainingAmount);
    } else {
      // Avalanche - focus on highest interest first
      currentDebts.sort((a, b) => b.interestRate - a.interestRate);
    }

    // Apply minimum payments and calculate interest
    for (let i = 0; i < currentDebts.length; i++) {
      const debt = currentDebts[i];

      // Apply interest for this month (annual rate / 12)
      const monthlyInterest =
        debt.remainingAmount * (debt.interestRate / 100 / 12);

      debt.remainingAmount += monthlyInterest;

      // Apply minimum payment
      const minPayment =
        debt.minimumPayment || Math.max(debt.remainingAmount * 0.01, 500);

      debt.remainingAmount = Math.max(0, debt.remainingAmount - minPayment);
    }

    // Remove fully paid debts
    currentDebts = currentDebts.filter((debt) => debt.remainingAmount > 0);

    // Apply extra payment to first debt in the sorted list (following strategy)
    if (extraPayment > 0 && currentDebts.length > 0) {
      currentDebts[0].remainingAmount = Math.max(
        0,
        currentDebts[0].remainingAmount - extraPayment,
      );

      // If debt is paid off, roll over remaining extra payment to next debt
      if (currentDebts[0].remainingAmount === 0 && currentDebts.length > 1) {
        const remainingExtra = extraPayment - currentDebts[0].remainingAmount;

        currentDebts[1].remainingAmount = Math.max(
          0,
          currentDebts[1].remainingAmount - remainingExtra,
        );
      }
    }

    // Calculate total remaining debt for this month
    const totalRemaining = currentDebts.reduce(
      (sum, debt) => sum + debt.remainingAmount,
      0,
    );

    result.push(totalRemaining);

    // If all debts are paid off, fill the rest of the array with zeros
    if (totalRemaining === 0) {
      for (let i = month + 1; i < totalMonths; i++) {
        result.push(0);
      }
      break;
    }
  }

  return result;
}
