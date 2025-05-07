// components/ui/utils.ts

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // For PDFs we need to return the full data URL including the MIME type prefix
      // For images, we still return just the base64 data without the prefix
      if (file.type === "application/pdf") {
        // Return the complete data URL for PDFs
        resolve(reader.result as string);
      } else {
        // For images, just return the base64 part without the data URL prefix
        const base64String = (reader.result as string).split(",")[1];

        resolve(base64String);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const parseOcrText = (
  text: string,
  fileType: "income" | "expense",
): { amount: number; category: "income" | "expense" | "unknown" } => {
  const numberRegex = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+)/g;
  const numbers =
    text.match(numberRegex)?.map((num) => parseFloat(num.replace(/,/g, ""))) ||
    [];

  const incomeKeywords = [
    "เงินเดือน",
    "salary",
    "income",
    "รายได้",
    "โบนัส",
    "bonus",
  ];
  const expenseKeywords = [
    "ค่าใช้จ่าย",
    "expense",
    "bill",
    "บิล",
    "invoice",
    "ใบเสร็จ",
  ];

  let category: "income" | "expense" | "unknown" = fileType;
  const lowercaseText = text.toLowerCase();

  if (
    incomeKeywords.some((keyword) =>
      lowercaseText.includes(keyword.toLowerCase()),
    )
  ) {
    category = "income";
  } else if (
    expenseKeywords.some((keyword) =>
      lowercaseText.includes(keyword.toLowerCase()),
    )
  ) {
    category = "expense";
  }

  const amount = numbers.length > 0 ? Math.max(...numbers) : 0;

  return { amount, category };
};
