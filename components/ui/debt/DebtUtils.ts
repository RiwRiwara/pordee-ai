import { DebtItem } from "../types";
import { DebtCategory } from "@/types/debt";

// Priority order for categorizing debts to prevent duplicates
export const categorizeDebt = (debt: DebtItem): DebtCategory => {
  // First, check for exact matches with our new category system
  if (debt.debtType === DebtCategory.RevolvingDebt)
    return DebtCategory.RevolvingDebt;
  if (debt.debtType === DebtCategory.ProductInstallment)
    return DebtCategory.ProductInstallment;
  if (debt.debtType === DebtCategory.PersonalLoan)
    return DebtCategory.PersonalLoan;
  if (debt.debtType === DebtCategory.HousingLoan)
    return DebtCategory.HousingLoan;
  if (debt.debtType === DebtCategory.VehicleLoan)
    return DebtCategory.VehicleLoan;
  if (debt.debtType === DebtCategory.BusinessLoan)
    return DebtCategory.BusinessLoan;
  if (debt.debtType === DebtCategory.InformalLoan)
    return DebtCategory.InformalLoan;
  if (debt.debtType === DebtCategory.CreditCard)
    return DebtCategory.CreditCard;
  if (debt.debtType === DebtCategory.Other) return DebtCategory.Other;

  // Then check for specific known types with strict matching
  // 1. Credit Card specifically
  if (
    debt.debtType === "บัตรเครดิต" ||
    debt.originalPaymentType === "credit_card"
  ) {
    return DebtCategory.CreditCard;
  }
  
  // 2. Revolving Debt (includes other revolving credit)
  if (
    debt.originalPaymentType === "revolving" ||
    debt.originalPaymentType === "cash_card"
  ) {
    return DebtCategory.RevolvingDebt;
  }

  // 2. Product Installment
  if (
    debt.debtType === "ผ่อนสินค้า" ||
    debt.originalPaymentType === "product_installment"
  ) {
    return DebtCategory.ProductInstallment;
  }

  // 3. Personal Loan
  if (
    debt.debtType === "สินเชื่อส่วนบุคคล" ||
    debt.originalPaymentType === "personal_loan"
  ) {
    return DebtCategory.PersonalLoan;
  }

  // 4. Housing Loan
  if (
    debt.debtType === "สินเชื่อบ้าน" ||
    debt.debtType === "สินเชื่อที่อยู่อาศัย" ||
    debt.originalPaymentType === "housing_loan" ||
    debt.originalPaymentType === "mortgage"
  ) {
    return DebtCategory.HousingLoan;
  }

  // 5. Vehicle Loan
  if (
    debt.debtType === "สินเชื่อรถ" ||
    debt.debtType === "สินเชื่อรถยนต์" ||
    debt.originalPaymentType === "vehicle_loan" ||
    debt.originalPaymentType === "car_loan"
  ) {
    return DebtCategory.VehicleLoan;
  }

  // 6. Informal Loan
  if (
    debt.debtType === "เงินกู้นอกระบบ" ||
    debt.originalPaymentType === "informal_loan"
  ) {
    return DebtCategory.InformalLoan;
  }

  // Special handling for legacy data that might use "สินเชื่อ" as a generic term
  if (debt.debtType === "สินเชื่อ") {
    // Try to categorize based on name if possible
    const nameLower = debt.name.toLowerCase();

    if (
      nameLower.includes("บ้าน") ||
      nameLower.includes("house") ||
      nameLower.includes("home")
    ) {
      return DebtCategory.HousingLoan;
    }
    if (
      nameLower.includes("รถ") ||
      nameLower.includes("car") ||
      nameLower.includes("vehicle")
    ) {
      return DebtCategory.VehicleLoan;
    }

    // Default to personal loan if no specific indicators
    return DebtCategory.PersonalLoan;
  }

  // Default: Other Debts
  return DebtCategory.Other;
};

// Group debts by category, with additional tracking to detect duplicates
export const groupDebtsByCategory = (
  debts: DebtItem[],
): Record<DebtCategory, DebtItem[]> => {
  const result: Record<DebtCategory, DebtItem[]> = {
    [DebtCategory.RevolvingDebt]: [],
    [DebtCategory.ProductInstallment]: [],
    [DebtCategory.PersonalLoan]: [],
    [DebtCategory.HousingLoan]: [],
    [DebtCategory.VehicleLoan]: [],
    [DebtCategory.BusinessLoan]: [],
    [DebtCategory.InformalLoan]: [],
    [DebtCategory.CreditCard]: [],
    [DebtCategory.Other]: [],
  };

  // Track processed IDs to ensure no debt appears in multiple categories
  const processedIds = new Set<string>();

  debts.forEach((debt) => {
    if (debt._id && processedIds.has(debt._id)) {
      // Skip if already categorized (prevents duplicates)
      return;
    }

    const category = categorizeDebt(debt);

    result[category].push(debt);

    if (debt._id) {
      processedIds.add(debt._id);
    }
  });

  return result;
};

// Legacy filtering functions for backward compatibility
export const filterRevolvingDebt = (debts: DebtItem[]): DebtItem[] => {
  return debts.filter(
    (debt) => categorizeDebt(debt) === DebtCategory.RevolvingDebt,
  );
};

export const filterProductInstallment = (debts: DebtItem[]): DebtItem[] => {
  return debts.filter(
    (debt) => categorizeDebt(debt) === DebtCategory.ProductInstallment,
  );
};

export const filterPersonalLoan = (debts: DebtItem[]): DebtItem[] => {
  return debts.filter(
    (debt) => categorizeDebt(debt) === DebtCategory.PersonalLoan,
  );
};

export const filterHousingLoan = (debts: DebtItem[]): DebtItem[] => {
  return debts.filter(
    (debt) => categorizeDebt(debt) === DebtCategory.HousingLoan,
  );
};

export const filterVehicleLoan = (debts: DebtItem[]): DebtItem[] => {
  return debts.filter(
    (debt) => categorizeDebt(debt) === DebtCategory.VehicleLoan,
  );
};

export const filterInformalLoan = (debts: DebtItem[]): DebtItem[] => {
  return debts.filter(
    (debt) => categorizeDebt(debt) === DebtCategory.InformalLoan,
  );
};

export const filterOtherDebts = (debts: DebtItem[]): DebtItem[] => {
  return debts.filter((debt) => categorizeDebt(debt) === DebtCategory.Other);
};

// Format number with commas for display
export const formatNumber = (num: number): string => {
  return num.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Calculate total amount for a collection of debts
export const calculateTotalAmount = (
  debts: DebtItem[],
  amountField: keyof Pick<
    DebtItem,
    "totalAmount" | "remainingAmount" | "minimumPayment"
  > = "remainingAmount",
): number => {
  return debts.reduce((sum, debt) => {
    const amount = debt[amountField] || 0;

    return sum + (typeof amount === "number" ? amount : 0);
  }, 0);
};

// Calculate percentage of total debt for a category
export const calculatePercentage = (
  categoryAmount: number,
  totalAmount: number,
): number => {
  if (totalAmount === 0) return 0;

  return (categoryAmount / totalAmount) * 100;
};

// Get color based on debt category
export const getCategoryColor = (category: DebtCategory): string => {
  switch (category) {
    case DebtCategory.RevolvingDebt:
      return "bg-blue-500";
    case DebtCategory.ProductInstallment:
      return "bg-green-500";
    case DebtCategory.PersonalLoan:
      return "bg-purple-500";
    case DebtCategory.HousingLoan:
      return "bg-indigo-500";
    case DebtCategory.VehicleLoan:
      return "bg-cyan-500";
    case DebtCategory.BusinessLoan:
      return "bg-amber-500";
    case DebtCategory.InformalLoan:
      return "bg-red-500";
    case DebtCategory.CreditCard:
      return "bg-blue-600";
    case DebtCategory.Other:
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

// Get the text color for the risk level based on debt-to-income ratio
export const getRiskLevelColor = (dtiRatio: number): string => {
  if (dtiRatio <= 40) return "text-green-500"; // ปลอดภัย (สีเขียว)
  if (dtiRatio <= 60) return "text-yellow-500"; // เริ่มเสี่ยง (สีเหลือง)
  if (dtiRatio <= 80) return "text-orange-500"; // เสี่ยงสูง (สีส้ม)

  return "text-red-500"; // วิกฤติ (สีแดง)
};

// Get the risk level text based on debt-to-income ratio
export const getRiskLevelText = (dtiRatio: number): string => {
  if (dtiRatio <= 40) return "ปลอดภัย";
  if (dtiRatio <= 60) return "เริ่มเสี่ยง";
  if (dtiRatio <= 80) return "เสี่ยงสูง";

  return "วิกฤติ";
};
