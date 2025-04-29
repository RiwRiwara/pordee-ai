// components/ui/types.ts
export interface DebtItem {
  _id: string;
  name: string;
  debtType: string; // Thai values: "บัตรเครดิต", "สินเชื่อ", "อื่นๆ"
  originalPaymentType?: string; // Optional original payment type (for guest mode)
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  paymentDueDay?: number;
  startDate?: string;
  estimatedPayoffDate?: string;
  notes?: string;
  attachments?: any[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface IncomeExpenseData {
  monthlyIncome: string;
  monthlyExpense: string;
}

export interface FileData {
  url: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  isProcessing?: boolean;
  isOcrProcessed?: boolean;
  ocrText?: string;
  ocrAmount?: number;
  ocrCategory?: "income" | "expense" | "unknown";
  isOcrAccepted?: boolean;
}

export interface IncomeExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: IncomeExpenseData & {
      incomeAttachments?: FileData[];
      expenseAttachments?: FileData[];
    },
  ) => void;
  initialData?: IncomeExpenseData;
  initialIncomeAttachments?: FileData[];
  initialExpenseAttachments?: FileData[];
}

export interface FileUploadSectionProps {
  fileType: "income" | "expense";
  uploadedFiles: FileData[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  isProcessingOcr: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  triggerFileUpload: () => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "income" | "expense",
  ) => Promise<void>;
  processFileWithOcr: (
    file: FileData,
    fileType: "income" | "expense",
  ) => Promise<void>;
  viewFilePreview: (file: FileData) => void;
  removeFile: (index: number) => void;
  acceptOcrRecommendation: (file: FileData) => void;
  rejectOcrRecommendation: (file: FileData) => void;
}
