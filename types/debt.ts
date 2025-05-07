// Shared debt types that can be used in both client and server components

// Define debt types for better categorization
export enum DebtCategory {
  RevolvingDebt = "หนี้สินหมุนเวียน",
  ProductInstallment = "หนี้สินผ่อนสินค้า",
  PersonalLoan = "สินเชื่อส่วนบุคคล",
  HousingLoan = "สินเชื่อที่อยู่อาศัย",
  VehicleLoan = "สินเชื่อรถยนต์",
  BusinessLoan = "สินเชื่อธุรกิจ",
  InformalLoan = "เงินกู้นอกระบบ",
  CreditCard = "บัตรเครดิต",
  Other = "หนี้อื่นๆ",
}

// Map debt type to a category for filtering
export const mapDebtTypeToCategory = (debtType: string): string => {
  // Map debtType to categories based on the standardized DebtCategory enum
  switch (debtType) {
    case DebtCategory.CreditCard:
      return "credit_card";
    case DebtCategory.RevolvingDebt:
      return "revolving";
    case DebtCategory.HousingLoan:
      return "home";
    case DebtCategory.VehicleLoan:
      return "car";
    case DebtCategory.PersonalLoan:
      return "personal";
    case DebtCategory.BusinessLoan:
      return "business";
    case DebtCategory.InformalLoan:
      return "informal";
    case DebtCategory.ProductInstallment:
      return "installment";
    // Legacy mappings for backward compatibility
    case "บัตรเครดิต":
      return "credit_card";
    case "สินเชื่อบ้าน":
      return "home";
    case "สินเชื่อรถยนต์":
      return "car";
    case "สินเชื่อ":
      return "personal";
    default:
      return "other";
  }
};
