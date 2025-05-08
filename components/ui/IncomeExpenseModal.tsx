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
import { useTracking } from "@/lib/tracking";

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
  const {
    trackDebtInputStart,
    trackDebtInputFinish,
    trackEdit,
    trackOCRUsage,
  } = useTracking();
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

  // Handle mobile keyboard by adjusting modal height dynamically
  useEffect(() => {
    if (!isOpen) return;

    // Initial calculation of viewport height
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Set initial viewport height
    handleResize();
    
    // Add event listeners for various mobile scenarios
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    
    // For iOS devices specifically
    const handleFocus = () => {
      // Add small delay to ensure the keyboard is fully open
      setTimeout(() => {
        // Scroll the focused element into view
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };
    
    // Apply focus handling to all input elements in the modal
    const inputElements = document.querySelectorAll('input, textarea');
    inputElements.forEach(input => {
      input.addEventListener('focus', handleFocus);
    });

    return () => {
      // Clean up all event listeners
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      inputElements.forEach(input => {
        input.removeEventListener('focus', handleFocus);
      });
    };
  }, [isOpen]);

  // Reset preview state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPreviewFile(null);
      setShowPreview(false);
    }
  }, [isOpen]);

  // Reset form with initialData when modal is opened
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        monthlyIncome: initialData.monthlyIncome || "",
        monthlyExpense: initialData.monthlyExpense || "",
      });
    }
  }, [isOpen, initialData, reset]);

  // Separate effect for tracking to prevent infinite loops
  useEffect(() => {
    // Only track when modal is first opened
    if (isOpen) {
      // Using a timeout to break potential render cycles
      const timer = setTimeout(() => {
        trackDebtInputStart();
      }, 100);

      return () => clearTimeout(timer);
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
    // Track OCR usage
    trackOCRUsage(true);
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

      // Determine if the file is a PDF or an image based on file type
      const isPdf = file.type === "application/pdf";
      const documentType = isPdf ? "pdf" : "image";

      // Convert file to base64 - fileToBase64 now returns full data URL for PDFs
      // and base64 only for images
      const fileData = await fileToBase64(file.file);

      // Call the OCR service with appropriate file type parameters
      const ocrText = await aiService.ocr(fileData, {
        detail: "high",
        fileType: documentType,
        fileName: file.name,
      });

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
        `วิเคราะห์ข้อมูลจาก${isPdf ? "ไฟล์ PDF" : "รูปภาพ"}สำเร็จ`,
        "solid",
        "success",
      );
    } catch (error: any) {
      console.error("OCR processing error:", error);

      // Provide more specific error messages
      let errorMessage = "ไม่สามารถวิเคราะห์ข้อมูลจากเอกสารได้";

      if (error.message && error.message.includes("invalid_image_format")) {
        errorMessage =
          "รูปแบบไฟล์ไม่ถูกต้อง โปรดใช้ไฟล์ PNG, JPEG, GIF, หรือ PDF เท่านั้น";
      } else if (error.message && error.message.includes("PDF")) {
        errorMessage =
          "ไม่สามารถประมวลผลไฟล์ PDF ได้ โปรดตรวจสอบว่าไฟล์มีรูปแบบที่ถูกต้อง";
      }

      showNotification("เกิดข้อผิดพลาด", errorMessage, "solid", "danger");

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
      // Track when user finishes inputting finance data
      trackDebtInputFinish();
      // Track as an edit
      trackEdit();

      // Parse values to ensure they're valid numbers with 2 decimal places
      // Use null checks to avoid errors with undefined values
      const grossIncomeValue = parseFloat(
        parseFloat(
          (data.grossMonthlyIncome ? data.grossMonthlyIncome.replace(/,/g, "") : "0") || "0"
        ).toFixed(2),
      );
      const incomeValue = parseFloat(
        parseFloat(
          (data.monthlyIncome ? data.monthlyIncome.replace(/,/g, "") : "0") || "0"
        ).toFixed(2),
      );
      const expenseValue = parseFloat(
        parseFloat(
          (data.monthlyExpense ? data.monthlyExpense.replace(/,/g, "") : "0") || "0"
        ).toFixed(2),
      );

      // Format the values for display
      const formattedData = {
        grossMonthlyIncome: formatNumber(grossIncomeValue),
        monthlyIncome: formatNumber(incomeValue),
        monthlyExpense: formatNumber(expenseValue),
      };

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

      const finalData = {
        grossMonthlyIncome: grossIncomeValue.toString(), // Add gross income for DTI calculation
        monthlyIncome: incomeValue.toString(),
        monthlyExpense: expenseValue.toString(),
        incomeAttachments:
          processedIncomeFiles.length > 0 ? processedIncomeFiles : undefined,
        expenseAttachments:
          processedExpenseFiles.length > 0 ? processedExpenseFiles : undefined,
        attachments:
          [...processedIncomeFiles, ...processedExpenseFiles].length > 0
            ? [...processedIncomeFiles, ...processedExpenseFiles]
            : undefined,
      };

      // Call onSave with the updated data including grossMonthlyIncome
      onSave(finalData);

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

  // Format input value to show proper decimal places
  const formatInputValue = (value: string) => {
    // Remove all non-numeric characters except decimal point
    let numericValue = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("");
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      numericValue = parts[0] + "." + parts[1].substring(0, 2);
    }

    // Format with commas for thousands
    if (numericValue) {
      const [integerPart, decimalPart] = numericValue.split(".");
      return (
        integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        (decimalPart ? "." + decimalPart : "")
      );
    }

    return numericValue;
  };

  return (
    <Modal
      isDismissable
      aria-label="รายได้และรายจ่าย"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900/50 to-zinc-900/30",
        base: "mt-0 bg-white rounded-xl shadow-xl max-w-[95vw] sm:max-w-3xl w-full",
        closeButton: "top-3 right-3 text-gray-500 hover:bg-gray-100",
        wrapper:
          "h-[calc(100*var(--vh))] overflow-hidden flex items-center justify-center",
      }}
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: 50,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      onClose={onClose}
    >
      <ModalContent className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[calc(100vh-40px)] sm:max-h-[calc(100vh-60px)] overflow-hidden pb-safe">
        {(onCloseAction) => (
          <>
            <ModalHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  รายได้และรายจ่าย
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  กรอกข้อมูลเพื่อวางแผนการเงินและชำระหนี้
                  หรืออัพโหลดเอกสารเพื่อให้ระบบวิเคราะห์ให้อัตโนมัติ
                </p>
                <div className="mt-2 text-xs bg-blue-50 p-2 rounded-md border border-blue-100 text-blue-700 hidden">
                  <p className="font-medium">
                    อัตราส่วนหนี้ต่อรายได้ (Debt-to-Income Ratio):
                  </p>
                  <ul className="mt-1 space-y-1">
                    <li className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2" />{" "}
                      ≤ 40%: ปลอดภัย - อยู่ในระดับดี
                      จัดการหนี้ได้โดยไม่กระทบค่าใช้จ่ายจำเป็น
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2" />{" "}
                      41-60%: เริ่มเสี่ยง - เริ่มกระทบกับการออมและสภาพคล่อง
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2" />{" "}
                      61-80%: เสี่ยงสูง - มีภาระหนี้มาก รายได้เริ่มไม่พอใช้
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2" />{" "}
                      {">"}80%: วิกฤติ - อาจหมุนเงินไม่ทัน และเข้าใกล้หนี้เสีย
                    </li>
                  </ul>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto max-h-[50vh] sm:max-h-[65vh] md:max-h-[70vh] overscroll-contain">
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

                <div className="mb-6 sm:mb-8 bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center mb-2">
                    <svg
                      className="mr-2 w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    <h4 className="font-medium text-gray-800">
                      รายได้ต่อเดือน
                    </h4>
                  </div>

                  <p className="text-xs text-gray-600 mb-3">
                    ระบุรายได้รวมทั้งหมดต่อเดือน
                    หรืออัพโหลดสลิปเงินเดือนเพื่อวิเคราะห์อัตโนมัติ
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="monthlyIncome"
                      >
                        จำนวนเงิน
                      </label>
                      <Controller
                        control={control}
                        name="monthlyIncome"
                        render={({ field }) => (
                          <Input
                            {...field}
                            aria-label="รายได้ต่อเดือน"
                            className="border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full touch-manipulation"
                            endContent={
                              <span className="text-gray-400">บาท</span>
                            }
                            inputMode="decimal"
                            placeholder="ระบุรายได้ต่อเดือน"
                            size="lg"
                            startContent={
                              <div className="pointer-events-none flex items-center">
                                <span className="text-green-400 font-medium">
                                  ฿
                                </span>
                              </div>
                            }
                            type="text"
                            value={field.value || ""}
                            onBlur={() => {
                              // Force scroll to top of input field on blur
                              if (window.innerWidth < 640) { // Mobile only
                                setTimeout(() => window.scrollTo(0, 0), 50);
                              }
                            }}
                            onChange={(e) => {
                              const formattedValue = formatInputValue(
                                e.target.value,
                              );

                              field.onChange(formattedValue);
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>
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

                <div className="mb-4 sm:mb-6">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="monthlyExpense"
                  >
                    รายจ่ายต่อเดือน
                  </label>
                  <Controller
                    control={control}
                    name="monthlyExpense"
                    render={({ field }) => (
                      <Input
                        {...field}
                        aria-label="รายจ่ายต่อเดือน"
                        className="border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 w-full touch-manipulation"
                        endContent={<span className="text-gray-400">บาท</span>}
                        inputMode="decimal"
                        placeholder="0.00"
                        startContent={<span className="text-gray-400">฿</span>}
                        type="text"
                        value={field.value || ""}
                        onBlur={() => {
                          // Force scroll to top of input field on blur
                          if (window.innerWidth < 640) { // Mobile only
                            setTimeout(() => window.scrollTo(0, 0), 50);
                          }
                        }}
                        onChange={(e) => {
                          const formattedValue = formatInputValue(
                            e.target.value,
                          );

                          field.onChange(formattedValue);
                        }}
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

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 rounded-lg flex items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      รายได้สุทธิ
                    </h4>
                    <p className="text-base sm:text-lg font-semibold text-green-600">
                      ฿{formatNumber(disposableIncome)}
                    </p>
                  </div>
                  <div className="ml-auto text-right text-xs text-gray-500">
                    <p>รายได้ - รายจ่าย</p>
                    <p>เงินที่เหลือสำหรับการใช้จ่ายอื่นๆ</p>
                  </div>
                </div>
              </form>
            </ModalBody>

            <ModalFooter className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 flex justify-end gap-2 mt-auto sticky bottom-0 bg-white pb-safe">
              <Button
                aria-label="ยกเลิก"
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                onPress={onClose}
              >
                ยกเลิก
              </Button>
              <Button
                aria-label="ยืนยันข้อมูล"
                className="bg-green-500 text-white hover:bg-green-600"
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
