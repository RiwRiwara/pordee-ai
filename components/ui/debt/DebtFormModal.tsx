"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";

import { useCustomToast } from "../ToastNotification";

import DebtFileUpload from "./DebtFileUpload";
import { DebtFormData, FileData, DebtFormModalProps } from "./types";
import { fileToBase64, parseOcrText } from "./utils";

import { useGuest } from "@/context/GuestContext";
import { saveLocalDebt, LocalDebtItem } from "@/lib/localStorage";
import AIService from "@/lib/aiService";

const debtTypes = [
  { label: "บัตรเครดิต", value: "credit_card" },
  { label: "บัตรกดเงินสด", value: "cash_card" },
  { label: "สินเชื่อบุคคล", value: "personal_loan" },
  { label: "สินเชื่อรถยนต์", value: "auto_loan" },
  { label: "สินเชื่อบ้าน", value: "mortgage_loan" },
  { label: "สินเชื่ออื่นๆ", value: "other_loan" },
];

const paymentStatusOptions = [
  { label: "ปกติ", value: "normal" },
  { label: "ค้างชำระ / ใกล้ผิดนัด", value: "overdue" },
];

// Custom Select Component
const CustomSelect: React.FC<{
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
}> = ({ options, value, onChange, placeholder, id, ariaLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);
  const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null);

  return (
    <div className="relative">
      <button
        aria-label={ariaLabel}
        className="w-full border border-yellow-400 rounded-lg p-2 text-left bg-white focus:ring-2 focus:ring-yellow-500"
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.label : placeholder || "เลือก"}
      </button>
      {isOpen && (
        <div
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox" // Indicates the dropdown is a listbox
        >
          {options.map((option, index) => {
            const optionId = `option-${option.value}`; // Unique ID for ARIA

            return (
              <div
                key={option.value}
                aria-selected={option.value === value} // Update dynamically if needed
                className="p-2 hover:bg-gray-100 cursor-pointer"
                id={optionId} // Unique ID for ARIA
                role="option" // Indicates this is a selectable option
                tabIndex={0} // Makes the div focusable
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault(); // Prevent scrolling on Space
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Custom Modal Component
const CustomModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <button
          aria-label="ปิด"
          className="absolute top-3 right-3 text-gray-500 hover:bg-gray-100 p-1 rounded-full"
          onClick={onClose}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

const DebtFormModal: React.FC<DebtFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { showNotification } = useCustomToast();
  const { isGuestMode } = useGuest();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiService = new AIService();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<DebtFormData>({
    defaultValues: initialData || {
      debtType: "",
      paymentType: "revolving",
      debtName: "",
      totalAmount: "",
      minimumPayment: "",
      interestRate: "",
      dueDate: "",
      paymentStatus: "normal",
    },
    mode: "onChange",
  });

  const paymentType = watch("paymentType");

  useEffect(() => {
    if (!isOpen) {
      reset();
      setUploadedFiles([]);
    }
  }, [isOpen, reset]);

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const files = Array.from(e.target.files);

    try {
      const validFiles = files.filter((file) => {
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "application/pdf",
        ];
        const maxSize = 10 * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
          showNotification(
            "ไฟล์ไม่ถูกต้อง",
            `ไฟล์ ${file.name} ไม่ใช่ไฟล์รูปภาพหรือ PDF`,
            "solid",
            "warning",
          );

          return false;
        }

        if (file.size > maxSize) {
          showNotification(
            "ไฟล์ขนาดใหญ่เกินไป",
            `ไฟล์ ${file.name} มีขนาดใหญ่เกิน 10MB`,
            "solid",
            "warning",
          );

          return false;
        }

        return true;
      });

      if (validFiles.length === 0) {
        setIsUploading(false);

        return;
      }

      const uploadedResults = validFiles.map((file) => {
        const url = URL.createObjectURL(file);

        return {
          url,
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          isProcessing: false,
          isOcrProcessed: false,
          isOcrAccepted: false,
        };
      });

      setUploadedFiles((prev) => [...prev, ...uploadedResults]);

      for (const fileData of uploadedResults) {
        await processFileWithOcr(fileData);
      }

      showNotification(
        "อัพโหลดสำเร็จ",
        `อัพโหลดไฟล์สำเร็จ ${validFiles.length} ไฟล์`,
        "solid",
        "success",
      );
    } catch {
      showNotification(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถอัพโหลดไฟล์ได้",
        "solid",
        "danger",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const processFileWithOcr = async (file: FileData) => {
    if (!file.file || file.isOcrProcessed) return;

    setIsProcessingOcr(true);

    try {
      const updateFiles = (files: FileData[]) =>
        files.map((f) =>
          f.name === file.name ? { ...f, isProcessing: true } : f,
        );

      setUploadedFiles((prev) => updateFiles(prev));

      const base64Image = await fileToBase64(file.file);
      const ocrText = await aiService.ocr(base64Image, { detail: "high" });
      const ocrData = parseOcrText(ocrText);

      const updateFilesWithResults = (files: FileData[]) =>
        files.map((f) =>
          f.name === file.name
            ? {
                ...f,
                isProcessing: false,
                isOcrProcessed: true,
                ocrData,
              }
            : f,
        );

      setUploadedFiles((prev) => updateFilesWithResults(prev));

      showNotification(
        "OCR สำเร็จ",
        `วิเคราะห์ข้อมูลจาก ${file.name} สำเร็จ`,
        "solid",
        "success",
      );
    } catch {
      showNotification(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถวิเคราะห์ข้อมูลจากเอกสารได้",
        "solid",
        "danger",
      );

      const resetFiles = (files: FileData[]) =>
        files.map((f) =>
          f.name === file.name ? { ...f, isProcessing: false } : f,
        );

      setUploadedFiles((prev) => resetFiles(prev));
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const acceptOcrRecommendation = (file: FileData) => {
    if (file.ocrData) {
      Object.entries(file.ocrData).forEach(([key, value]) => {
        if (value) {
          setValue(key as keyof DebtFormData, value);
        }
      });
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name ? { ...f, isOcrAccepted: true } : f,
        ),
      );
      showNotification(
        "ยอมรับคำแนะนำ",
        `นำข้อมูลจาก ${file.name} ไปใช้ในฟอร์ม`,
        "solid",
        "success",
      );
    }
  };

  const rejectOcrRecommendation = (file: FileData) => {
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.name === file.name ? { ...f, isOcrAccepted: false } : f,
      ),
    );
    showNotification(
      "ปฏิเสธคำแนะนำ",
      `ข้อมูลจาก ${file.name} ไม่ถูกนำไปใช้`,
      "solid",
      "warning",
    );
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: DebtFormData) => {
    try {
      const formattedData: Omit<
        LocalDebtItem,
        "id" | "createdAt" | "updatedAt" | "deletedAt"
      > = {
        name: data.debtName,
        debtType: data.debtType,
        paymentType: data.paymentType,
        totalAmount: data.totalAmount,
        minimumPayment: data.minimumPayment,
        interestRate: data.interestRate,
        dueDate: data.dueDate,
        paymentStatus: data.paymentStatus,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      };

      if (isGuestMode) {
        saveLocalDebt(formattedData);
      }

      onSave({ ...data, attachments: uploadedFiles });

      showNotification(
        "บันทึกข้อมูลสำเร็จ",
        `ข้อมูลหนี้${isGuestMode ? " (โหมดทดลอง)" : ""}ถูกบันทึกเรียบร้อยแล้ว`,
        "solid",
        "success",
      );

      reset();
      setUploadedFiles([]);
      onClose();
    } catch {
      showNotification(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่",
        "solid",
        "danger",
      );
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <div>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            เพิ่มรายการหนี้
          </h3>
          <p className="text-sm text-gray-500">กรอกข้อมูลหนี้ของคุณ</p>
        </div>

        <div className="px-6 py-4 max-h-[60vh] md:max-h-[500px] overflow-y-auto">
          <form id="debt-form" onSubmit={handleSubmit(onSubmit)}>
            <DebtFileUpload
              acceptOcrRecommendation={acceptOcrRecommendation}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              isProcessingOcr={isProcessingOcr}
              isUploading={isUploading}
              processFileWithOcr={processFileWithOcr}
              rejectOcrRecommendation={rejectOcrRecommendation}
              removeFile={removeFile}
              setIsUploading={setIsUploading}
              setUploadedFiles={setUploadedFiles}
              triggerFileUpload={triggerFileUpload}
              uploadedFiles={uploadedFiles}
            />

            <div className="mb-4">
              <label
                className="block mb-1 font-medium text-gray-700"
                htmlFor="debtType"
              >
                ประเภทหนี้
              </label>
              <Controller
                control={control}
                name="debtType"
                render={({ field }) => (
                  <CustomSelect
                    ariaLabel="เลือกประเภทหนี้"
                    id="debtType"
                    options={debtTypes}
                    placeholder="เลือกประเภทหนี้"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
                rules={{ required: "กรุณาเลือกประเภทหนี้" }}
              />
              {errors.debtType && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.debtType.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                className="block mb-1 font-medium text-gray-700"
                htmlFor="paymentType"
              >
                ลักษณะหนี้
              </label>
              <Controller
                control={control}
                name="paymentType"
                render={({ field }) => (
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        checked={field.value === "revolving"}
                        className="mr-2"
                        name="paymentType"
                        type="radio"
                        value="revolving"
                        onChange={() => field.onChange("revolving")}
                      />
                      หนี้หมุนเวียน
                    </label>
                    <label className="flex items-center">
                      <input
                        checked={field.value === "installment"}
                        className="mr-2"
                        name="paymentType"
                        type="radio"
                        value="installment"
                        onChange={() => field.onChange("installment")}
                      />
                      หนี้ผ่อนชำระ
                    </label>
                  </div>
                )}
              />
            </div>

            <div className="mb-4">
              <label
                className="block mb-1 font-medium text-gray-700"
                htmlFor="debtName"
              >
                ชื่อหนี้
              </label>
              <Controller
                control={control}
                name="debtName"
                render={({ field }) => (
                  <input
                    {...field}
                    className="w-full border border-yellow-400 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
                    id="debtName"
                    placeholder="เช่น บัตร KTC, สินเชื่อรถยนต์"
                  />
                )}
                rules={{ required: "กรุณาระบุชื่อหนี้" }}
              />
              {errors.debtName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.debtName.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                className="block mb-1 font-medium text-gray-700"
                htmlFor="totalAmount"
              >
                {paymentType === "revolving"
                  ? "วงเงิน / ยอดใช้จ่าย"
                  : "ยอดสินเชื่อ / ยอดคงเหลือ"}
              </label>
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="totalAmount"
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full border border-yellow-400 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
                      id="totalAmount"
                      placeholder="0"
                      type="number"
                    />
                  )}
                  rules={{ required: "กรุณาระบุยอดหนี้" }}
                />
                <span className="text-sm text-gray-500">บาท</span>
              </div>
              {errors.totalAmount && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.totalAmount.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                className="block mb-1 font-medium text-gray-700"
                htmlFor="minimumPayment"
              >
                ยอดจ่ายขั้นต่ำ / ค่างวด
              </label>
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="minimumPayment"
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full border border-yellow-400 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
                      id="minimumPayment"
                      placeholder="0"
                      type="number"
                    />
                  )}
                  rules={{
                    required:
                      paymentType === "revolving"
                        ? "กรุณาระบุยอดจ่ายขั้นต่ำ"
                        : false,
                  }}
                />
                <span className="text-sm text-gray-500">บาท</span>
              </div>
              {errors.minimumPayment && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.minimumPayment.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                className="block mb-1 font-medium text-gray-700"
                htmlFor="interestRate"
              >
                อัตราดอกเบี้ย
              </label>
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="interestRate"
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full border border-yellow-400 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
                      id="interestRate"
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                    />
                  )}
                  rules={{ required: "กรุณาระบุอัตราดอกเบี้ย" }}
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
              {errors.interestRate && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.interestRate.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                className="block mb-1 font-medium text-gray-700"
                htmlFor="dueDate"
              >
                วันครบกำหนดชำระ
              </label>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <CustomSelect
                    ariaLabel="เลือกวันครบกำหนดชำระ"
                    id="dueDate"
                    options={[...Array(31)].map((_, i) => ({
                      label: `ทุกวันที่ ${i + 1}`,
                      value: `${i + 1}`,
                    }))}
                    placeholder="เลือกวัน"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
                rules={{ required: "กรุณาเลือกวันครบกำหนดชำระ" }}
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                className="block mb-1 font-medium text-gray-700"
                htmlFor="paymentStatus"
              >
                สถานะการชำระหนี้
              </label>
              <Controller
                control={control}
                name="paymentStatus"
                render={({ field }) => (
                  <CustomSelect
                    ariaLabel="เลือกสถานะการชำระหนี้"
                    id="paymentStatus"
                    options={paymentStatusOptions}
                    placeholder="เลือกสถานะ"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.paymentStatus && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.paymentStatus.message}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            aria-label="บันทึกรายการหนี้"
            className="w-full bg-yellow-400 text-black py-3 rounded-lg font-medium hover:bg-yellow-500 transition disabled:opacity-50"
            disabled={!isValid}
            form="debt-form"
            type="submit"
          >
            บันทึกรายการหนี้
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default DebtFormModal;
