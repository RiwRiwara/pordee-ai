import { DebtItem } from "../../types";

export interface DebtPlanData {
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

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      position: string;
      labels: {
        font: {
          size: number;
        };
      };
    };
    tooltip: {
      callbacks: {
        label: (context: any) => string;
      };
    };
  };
}
