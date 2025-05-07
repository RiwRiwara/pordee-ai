import { DebtItem } from "../types";

export interface DebtPlan {
  _id: string;
  name: string;
  debtType: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  paymentDueDay?: number;
  goalType?: string;
  paymentStrategy?: string;
  monthlyPayment?: number;
  timeInMonths?: number;
  customSettings?: {
    goalBalance?: number;
  };
}

export interface DebtPlanModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  debtContext: DebtItem[];
  riskPercentage?: number;
  goalType?: string;
  paymentStrategy?: string;
  monthlyPayment?: number;
  timeInMonths?: number;
  existingPlanId?: string;
  onSavePlan: (plan: DebtPlan) => void;
}
