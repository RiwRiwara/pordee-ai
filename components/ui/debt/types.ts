// components/ui/debt/types.ts
export interface DebtFormData {
  debtType: string;
  paymentType: "installment" | "revolving";
  debtName: string;
  totalAmount: string;
  minimumPayment: string;
  interestRate: string;
  dueDate: string;
  paymentStatus: string;
  currentInstallment?: string; // งวดที่จ่าย
  totalInstallments?: string; // งวดทั้งหมด
}

export interface FileData {
  url: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  isProcessing?: boolean;
  isOcrProcessed?: boolean;
  ocrData?: Partial<DebtFormData>;
  isOcrAccepted?: boolean;
}

export interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DebtFormData & { attachments?: FileData[] }) => void;
  initialData?: DebtFormData;
}

export interface DebtFileUploadProps {
  uploadedFiles: FileData[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  isProcessingOcr: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  triggerFileUpload: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  processFileWithOcr: (file: FileData) => Promise<void>;
  removeFile: (index: number) => void;
  acceptOcrRecommendation: (file: FileData) => void;
  rejectOcrRecommendation: (file: FileData) => void;
}
