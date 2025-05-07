import { DebtItem } from "@/components/ui/types";

// DTI Risk Level Thresholds based on memory
export const DTI_THRESHOLDS = {
  SAFE: 40, // ≤ 40%: ปลอดภัย (สีเขียว)
  MODERATE: 60, // 41-60%: เริ่มเสี่ยง (สีเหลือง)
  HIGH: 80, // 61-80%: เสี่ยงสูง (สีส้ม)
  CRITICAL: 100, // >80%: วิกฤติ (สีแดง)
};

export interface DTIRiskStatus {
  label: string;
  color: string;
  bgColor?: string;
  colorClass?: string;
  trackColor?: string;
  indicatorColor?: string;
  description: string;
}

// Shared interface for debt context
export interface DebtContext {
  debtItems: DebtItem[];
  income?: number | string;
}

/**
 * Calculate DTI (Debt-to-Income) ratio
 * Formula: (all minimum debt / all income before expense and tax) * 100
 */
export function calculateDTI(debtContext?: DebtContext): number {
  if (!debtContext) return 0;

  // Calculate total minimum debt payments
  const totalMinimumDebt = debtContext.debtItems.reduce((sum, debt) => {
    const minimumPayment =
      typeof debt.minimumPayment === "string"
        ? parseFloat(debt.minimumPayment || "0")
        : debt.minimumPayment || 0;

    return sum + minimumPayment;
  }, 0);

  // Get income before expenses and tax
  const income =
    typeof debtContext.income === "string"
      ? parseFloat(debtContext.income || "0")
      : debtContext.income || 0;

  // Avoid division by zero
  if (income <= 0) return 0;

  // Calculate debt-to-income ratio: (all minimum debt / income) * 100
  return (totalMinimumDebt / income) * 100;
}

/**
 * Get risk status based on DTI percentage
 * Returns consistent risk status object for use across components
 */
export function getDTIRiskStatus(dtiPercentage: number): DTIRiskStatus {
  if (dtiPercentage <= DTI_THRESHOLDS.SAFE) {
    return {
      label: "ปลอดภัย",
      color: "text-green-500",
      bgColor: "bg-green-500",
      colorClass: "text-green-500",
      trackColor: "stroke-green-100",
      indicatorColor: "stroke-green-500",
      description: "อยู่ในระดับดี จัดการหนี้ได้โดยไม่กระทบค่าใช้จ่ายจำเป็น",
    };
  }

  if (dtiPercentage <= DTI_THRESHOLDS.MODERATE) {
    return {
      label: "เริ่มเสี่ยง",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
      colorClass: "text-yellow-500",
      trackColor: "stroke-yellow-100",
      indicatorColor: "stroke-yellow-500",
      description: "เริ่มกระทบกับการออมและสภาพคล่อง แต่ยังพอจัดการได้",
    };
  }

  if (dtiPercentage <= DTI_THRESHOLDS.HIGH) {
    return {
      label: "เสี่ยงสูง",
      color: "text-orange-500",
      bgColor: "bg-orange-500",
      colorClass: "text-orange-500",
      trackColor: "stroke-orange-100",
      indicatorColor: "stroke-orange-500",
      description: "มีภาระหนี้มาก รายได้เริ่มไม่พอใช้หลังชำระหนี้",
    };
  }

  return {
    label: "วิกฤติ",
    color: "text-red-500",
    bgColor: "bg-red-500",
    colorClass: "text-red-500",
    trackColor: "stroke-red-100",
    indicatorColor: "stroke-red-500",
    description: "อยู่ในภาวะอาจหมุนเงินไม่ทัน และเข้าใกล้หนี้เสีย",
  };
}

/**
 * Save DTI risk assessment to database
 */
export async function saveDTIRiskAssessment(
  userId: string,
  dtiPercentage: number,
) {
  try {
    const riskStatus = getDTIRiskStatus(dtiPercentage);

    // Create risk factor for DTI
    const dtiRiskFactor = {
      name: "debt_to_income_ratio",
      value: dtiPercentage,
      level:
        dtiPercentage <= DTI_THRESHOLDS.SAFE
          ? "ต่ำ"
          : dtiPercentage <= DTI_THRESHOLDS.MODERATE
            ? "กลาง"
            : "สูง",
    };

    // Save to database
    const response = await fetch("/api/risk-assessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        riskFactors: [dtiRiskFactor],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error saving DTI risk assessment:", error);

    return false;
  }
}

/**
 * Get latest DTI risk assessment from database
 */
export async function getLatestDTIRiskAssessment(
  userId: string,
): Promise<number | null> {
  try {
    const response = await fetch(`/api/risk-assessment?userId=${userId}`);

    if (response.ok) {
      const data = await response.json();

      if (data && data.length > 0) {
        // Get most recent assessment
        const latestAssessment = data[0];

        // Find DTI risk factor
        const dtiRiskFactor = latestAssessment.riskFactors.find(
          (factor: any) => factor.name === "debt_to_income_ratio",
        );

        if (dtiRiskFactor) {
          return dtiRiskFactor.value;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching DTI risk assessment:", error);

    return null;
  }
}
