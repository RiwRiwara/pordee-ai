// components/ui/debt/utils.ts
import { DebtFormData } from "./types";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];

      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const parseOcrText = (text: string): Partial<DebtFormData> => {
  const numberRegex = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+)/g;
  const numbers =
    text.match(numberRegex)?.map((num) => parseFloat(num.replace(/,/g, ""))) ||
    [];

  const debtNameKeywords = [
    "บัตร",
    "card",
    "สินเชื่อ",
    "loan",
    "ktc",
    "scb",
    "krungsri",
  ];
  const interestRateRegex = /(\d{1,2}(?:\.\d{1,2})?)%/;
  const dueDateRegex = /วันที่\s*(\d{1,2})/;

  const lowercaseText = text.toLowerCase();
  let debtName = "";

  debtNameKeywords.some((keyword) => {
    if (lowercaseText.includes(keyword)) {
      debtName = keyword.charAt(0).toUpperCase() + keyword.slice(1);

      return true;
    }

    return false;
  });

  const totalAmount = numbers.length > 0 ? Math.max(...numbers).toString() : "";
  const minimumPayment =
    numbers.length > 1 ? Math.min(...numbers).toString() : "";
  const interestRateMatch = text.match(interestRateRegex);
  const dueDateMatch = text.match(dueDateRegex);

  return {
    debtName: debtName || "Unknown Debt",
    totalAmount,
    minimumPayment,
    interestRate: interestRateMatch ? interestRateMatch[1] : "",
    dueDate: dueDateMatch ? dueDateMatch[1] : "",
  };
};
