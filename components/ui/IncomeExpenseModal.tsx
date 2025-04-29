// components/ui/IncomeExpenseModal.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useForm, Controller } from "react-hook-form";

import { useCustomToast } from "./ToastNotification";
import FileUploadSection from "./FileUploadSection";
import { IncomeExpenseData, FileData, IncomeExpenseModalProps } from "./types";
import { fileToBase64, parseOcrText } from "./utils";

import AIService from "@/lib/aiService";
import { useGuest } from "@/context/GuestContext";
import { uploadToBlob } from "@/lib/blob";

const IncomeExpenseModal: React.FC<IncomeExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  initialIncomeAttachments,
  initialExpenseAttachments,
}) => {
  const { showNotification } = useCustomToast();
  const { isGuestMode } = useGuest();
  const [isUploadingIncome, setIsUploadingIncome] = useState(false);
  const [isUploadingExpense, setIsUploadingExpense] = useState(false);
  const [uploadedIncomeFiles, setUploadedIncomeFiles] = useState<FileData[]>(
    initialIncomeAttachments || [],
  );
  const [uploadedExpenseFiles, setUploadedExpenseFiles] = useState<FileData[]>(
    initialExpenseAttachments || [],
  );
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const incomeFileInputRef = useRef<HTMLInputElement>(null);
  const expenseFileInputRef = useRef<HTMLInputElement>(null);
  const aiService = new AIService();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IncomeExpenseData>({
    defaultValues: initialData || {
      monthlyIncome: "",
      monthlyExpense: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) {
      setPreviewFile(null);
      setShowPreview(false);
    }
  }, [isOpen]);

  const monthlyIncome = parseFloat(
    watch("monthlyIncome").replace(/,/g, "") || "0",
  );
  const monthlyExpense = parseFloat(
    watch("monthlyExpense").replace(/,/g, "") || "0",
  );
  const disposableIncome = Math.max(0, monthlyIncome - monthlyExpense);

  const triggerFileUpload = (fileType: "income" | "expense") => {
    const ref =
      fileType === "income" ? incomeFileInputRef : expenseFileInputRef;

    if (ref.current) {
      ref.current.click();
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "income" | "expense",
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const isIncome = fileType === "income";

    isIncome ? setIsUploadingIncome(true) : setIsUploadingExpense(true);
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
        isIncome ? setIsUploadingIncome(false) : setIsUploadingExpense(false);

        return;
      }

      const uploadResults = validFiles.map((file) => {
        const url = URL.createObjectURL(file);

        return {
          url,
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          isProcessing: false,
          isOcrProcessed: false,
          ocrCategory: "unknown" as "unknown",
          isOcrAccepted: false,
        };
      });

      if (isIncome) {
        setUploadedIncomeFiles((prev) => [...prev, ...uploadResults]);
      } else {
        setUploadedExpenseFiles((prev) => [...prev, ...uploadResults]);
      }

      for (const fileData of uploadResults) {
        await processFileWithOcr(fileData, fileType);
      }

      showNotification(
        "อัพโหลดสำเร็จ",
        `อัพโหลดไฟล์สำเร็จ`,
        "solid",
        "success",
      );
    } catch (error) {
      showNotification(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถอัพโหลดไฟล์ได้",
        "solid",
        "danger",
      );
    } finally {
      if (e.target) e.target.value = "";
      isIncome ? setIsUploadingIncome(false) : setIsUploadingExpense(false);
    }
  };

  const processFileWithOcr = async (
    file: FileData,
    fileType: "income" | "expense",
  ) => {
    if (!file.file || file.isOcrProcessed) return;

    const isIncome = fileType === "income";

    setIsProcessingOcr(true);

    try {
      const updateFiles = (files: FileData[]) =>
        files.map((f) =>
          f.name === file.name ? { ...f, isProcessing: true } : f,
        );

      if (isIncome) {
        setUploadedIncomeFiles((prev) => updateFiles(prev));
      } else {
        setUploadedExpenseFiles((prev) => updateFiles(prev));
      }

      const base64Image = await fileToBase64(file.file);
      const ocrText = await aiService.ocr(base64Image, { detail: "high" });
      const { amount, category } = parseOcrText(ocrText, fileType);

      const updateFilesWithResults = (files: FileData[]) =>
        files.map((f) =>
          f.name === file.name
            ? {
                ...f,
                isProcessing: false,
                isOcrProcessed: true,
                ocrText,
                ocrAmount: amount,
                ocrCategory: category,
              }
            : f,
        );

      if (isIncome) {
        setUploadedIncomeFiles((prev) => updateFilesWithResults(prev));
      } else {
        setUploadedExpenseFiles((prev) => updateFilesWithResults(prev));
      }

      showNotification(
        "OCR สำเร็จ",
        `วิเคราะห์ข้อมูลจากเอกสารสำเร็จ`,
        "solid",
        "success",
      );
    } catch (error) {
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

      if (isIncome) {
        setUploadedIncomeFiles((prev) => resetFiles(prev));
      } else {
        setUploadedExpenseFiles((prev) => resetFiles(prev));
      }
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const acceptOcrRecommendation = (
    file: FileData,
    fileType: "income" | "expense",
  ) => {
    const isIncome = fileType === "income";
    const updateFiles = (files: FileData[]) =>
      files.map((f) =>
        f.name === file.name ? { ...f, isOcrAccepted: true } : f,
      );

    if (isIncome) {
      setUploadedIncomeFiles((prev) => updateFiles(prev));
      if (file.ocrCategory === "income" && file.ocrAmount) {
        setValue("monthlyIncome", file.ocrAmount.toString());
      }
    } else {
      setUploadedExpenseFiles((prev) => updateFiles(prev));
      if (file.ocrCategory === "expense" && file.ocrAmount) {
        setValue("monthlyExpense", file.ocrAmount.toString());
      }
    }

    showNotification(
      "ยอมรับคำแนะนำ",
      `นำข้อมูลจาก ${file.name} ไปใช้ในฟอร์ม`,
      "solid",
      "success",
    );
  };

  const rejectOcrRecommendation = (
    file: FileData,
    fileType: "income" | "expense",
  ) => {
    const isIncome = fileType === "income";
    const updateFiles = (files: FileData[]) =>
      files.map((f) =>
        f.name === file.name ? { ...f, isOcrAccepted: false } : f,
      );

    if (isIncome) {
      setUploadedIncomeFiles((prev) => updateFiles(prev));
    } else {
      setUploadedExpenseFiles((prev) => updateFiles(prev));
    }

    showNotification(
      "ปฏิเสธคำแนะนำ",
      `ข้อมูลจาก ${file.name} ไม่ถูกนำไปใช้`,
      "solid",
      "warning",
    );
  };

  const viewFilePreview = (file: FileData) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const removeFile = (index: number, fileType: "income" | "expense") => {
    if (fileType === "income") {
      setUploadedIncomeFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setUploadedExpenseFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: IncomeExpenseData) => {
    try {
      setIsSaving(true);

      let processedIncomeFiles = [...uploadedIncomeFiles];
      let processedExpenseFiles = [...uploadedExpenseFiles];

      if (
        !isGuestMode &&
        (uploadedIncomeFiles.length > 0 || uploadedExpenseFiles.length > 0)
      ) {
        if (uploadedIncomeFiles.length > 0) {
          const incomeUploads = await Promise.all(
            uploadedIncomeFiles.map(async (fileData) => {
              if (!fileData.file) return fileData;

              try {
                const url = await uploadToBlob(
                  fileData.name,
                  fileData.file,
                  "income/",
                );

                return { ...fileData, url, file: undefined };
              } catch (err) {
                return fileData;
              }
            }),
          );

          processedIncomeFiles = incomeUploads;
        }

        if (uploadedExpenseFiles.length > 0) {
          const expenseUploads = await Promise.all(
            uploadedExpenseFiles.map(async (fileData) => {
              if (!fileData.file) return fileData;

              try {
                const url = await uploadToBlob(
                  fileData.name,
                  fileData.file,
                  "expense/",
                );

                return { ...fileData, url, file: undefined };
              } catch (err) {
                return fileData;
              }
            }),
          );

          processedExpenseFiles = expenseUploads;
        }
      } else if (isGuestMode) {
        processedIncomeFiles = uploadedIncomeFiles.map((f) => ({
          ...f,
          file: undefined,
        }));
        processedExpenseFiles = uploadedExpenseFiles.map((f) => ({
          ...f,
          file: undefined,
        }));
      }

      const formattedData = {
        ...data,
        monthlyIncome: data.monthlyIncome.replace(/,/g, ""),
        monthlyExpense: data.monthlyExpense.replace(/,/g, ""),
        incomeAttachments:
          processedIncomeFiles.length > 0 ? processedIncomeFiles : undefined,
        expenseAttachments:
          processedExpenseFiles.length > 0 ? processedExpenseFiles : undefined,
        attachments:
          [...processedIncomeFiles, ...processedExpenseFiles].length > 0
            ? [...processedIncomeFiles, ...processedExpenseFiles]
            : undefined,
      };

      onSave(formattedData);

      showNotification(
        "บันทึกข้อมูลสำเร็จ",
        `ข้อมูลรายได้และรายจ่าย${isGuestMode ? " (โหมดทดลอง)" : ""}ถูกบันทึกเรียบร้อยแล้ว`,
        "solid",
        "success",
      );

      reset();
      setUploadedIncomeFiles([]);
      setUploadedExpenseFiles([]);
      onClose();
    } catch (error) {
      showNotification(
        "บันทึกข้อมูลไม่สำเร็จ",
        "มีปัญหาในการบันทึกข้อมูล กรุณาลองอีกครั้ง",
        "solid",
        "danger",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Modal
      closeButton
      aria-label="แก้ไขรายได้และรายจ่าย"
      backdrop="blur"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900/50 to-zinc-900/30",
        base: "mt-4 md:mt-0 bg-white rounded-lg shadow-lg",
        closeButton: "top-3 right-3 text-gray-500 hover:bg-gray-100",
        wrapper: "max-h-[90vh] overflow-visible",
      }}
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      onClose={onClose}
    >
      <ModalContent>
        {(onCloseAction) => (
          <>
            <ModalHeader className="px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  กรอกข้อมูลรายได้ / รายจ่าย
                </h3>
                <p className="text-sm text-gray-500">
                  ช่วยวางแผนการชำระหนี้ที่เหมาะสม
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="px-6 py-4 overflow-y-auto max-h-[60vh] md:max-h-[500px]">
              <form id="income-expense-form" onSubmit={handleSubmit(onSubmit)}>
                <FileUploadSection
                  acceptOcrRecommendation={(file) =>
                    acceptOcrRecommendation(file, "income")
                  }
                  fileInputRef={incomeFileInputRef}
                  fileType="income"
                  handleFileChange={handleFileChange}
                  isProcessingOcr={isProcessingOcr}
                  isUploading={isUploadingIncome}
                  processFileWithOcr={processFileWithOcr}
                  rejectOcrRecommendation={(file) =>
                    rejectOcrRecommendation(file, "income")
                  }
                  removeFile={(index) => removeFile(index, "income")}
                  setIsUploading={setIsUploadingIncome}
                  setUploadedFiles={setUploadedIncomeFiles}
                  triggerFileUpload={() => triggerFileUpload("income")}
                  uploadedFiles={uploadedIncomeFiles}
                  viewFilePreview={viewFilePreview}
                />

                <div className="mb-4">
                  <Controller
                    control={control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <Input
                        {...field}
                        aria-label="รายได้ต่อเดือน"
                        className="border border-green-400 rounded-lg focus:ring-2 focus:ring-green-500"
                        endContent={<span className="text-gray-400">บาท</span>}
                        inputMode="numeric"
                        placeholder="0.00"
                        startContent={<span className="text-gray-400">฿</span>}
                        type="text"
                      />
                    )}
                    rules={{ required: "กรุณาระบุรายได้ต่อเดือน" }}
                  />
                  {errors.monthlyIncome && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.monthlyIncome.message}
                    </p>
                  )}
                </div>

                <FileUploadSection
                  acceptOcrRecommendation={(file) =>
                    acceptOcrRecommendation(file, "expense")
                  }
                  fileInputRef={expenseFileInputRef}
                  fileType="expense"
                  handleFileChange={handleFileChange}
                  isProcessingOcr={isProcessingOcr}
                  isUploading={isUploadingExpense}
                  processFileWithOcr={processFileWithOcr}
                  rejectOcrRecommendation={(file) =>
                    rejectOcrRecommendation(file, "expense")
                  }
                  removeFile={(index) => removeFile(index, "expense")}
                  setIsUploading={setIsUploadingExpense}
                  setUploadedFiles={setUploadedExpenseFiles}
                  triggerFileUpload={() => triggerFileUpload("expense")}
                  uploadedFiles={uploadedExpenseFiles}
                  viewFilePreview={viewFilePreview}
                />

                <div className="mb-4">
                  <Controller
                    control={control}
                    name="monthlyExpense"
                    render={({ field }) => (
                      <Input
                        {...field}
                        aria-label="รายจ่ายต่อเดือน"
                        className="border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        endContent={<span className="text-gray-400">บาท</span>}
                        inputMode="numeric"
                        placeholder="0.00"
                        startContent={<span className="text-gray-400">฿</span>}
                        type="text"
                      />
                    )}
                    rules={{ required: "กรุณาระบุรายจ่ายต่อเดือน" }}
                  />
                  {errors.monthlyExpense && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.monthlyExpense.message}
                    </p>
                  )}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">
                    รายได้สุทธิ (รายได้ - รายจ่าย)
                  </h4>
                  <p className="text-lg font-semibold text-green-600">
                    ฿{formatNumber(disposableIncome)}
                  </p>
                </div>
              </form>
            </ModalBody>

            <ModalFooter className="px-6 py-4 border-t border-gray-200">
              <Button
                aria-label="ยืนยันข้อมูล"
                className="w-full bg-yellow-400 text-black py-3 rounded-lg font-medium hover:bg-yellow-500 transition"
                color="primary"
                form="income-expense-form"
                isLoading={isSaving}
                type="submit"
              >
                ยืนยันข้อมูล
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default IncomeExpenseModal;
