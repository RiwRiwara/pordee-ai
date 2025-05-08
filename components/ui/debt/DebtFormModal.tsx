"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { FiSave } from "react-icons/fi";

import { useCustomToast } from "../ToastNotification";

import { fileToBase64, parseOcrText } from "./utils";
import DebtFileUpload from "./DebtFileUpload";
import { DebtFormData, FileData, DebtFormModalProps } from "./types";

import { useGuest } from "@/context/GuestContext";
import { saveLocalDebt } from "@/lib/localStorage";
import AIService from "@/lib/aiService";

const debtTypes = [
  { label: "บัตรเครดิต", value: "credit_card" },
  { label: "บัตรกดเงินสด", value: "cash_card" },
  { label: "สินเชื่อส่วนบุคคล", value: "personal_loan" },
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
          role="listbox"
        >
          {options.map((option) => (
            <div
              key={option.value}
              aria-selected={option.value === value}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              id={`option-${option.value}`}
              role="option"
              tabIndex={0}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(option.value);
                  setIsOpen(false);
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    defaultValues: {
      debtName: "",
      debtType: "",
      paymentType: "revolving",
      totalAmount: "",
      minimumPayment: "",
      interestRate: "",
      dueDate: "",
      paymentStatus: "normal",
      currentInstallment: "",
      totalInstallments: "",
    },
    mode: "onChange",
  });

  const paymentType = watch("paymentType");
  const formValues = watch();
  const allFieldsValid = useRef(false);

  // Check if all required fields are filled
  useEffect(() => {
    const requiredFields = [
      "debtName",
      "debtType",
      "totalAmount",
      "minimumPayment",
      "dueDate",
      "paymentStatus",
    ];

    // Add installment-specific fields if installment type is selected
    if (formValues.paymentType === "installment") {
      requiredFields.push("currentInstallment", "totalInstallments");
    }

    // Check if all required fields have values
    const allFilled = requiredFields.every(
      (field) =>
        formValues[field as keyof DebtFormData] &&
        formValues[field as keyof DebtFormData] !== "",
    );

    allFieldsValid.current = allFilled;
  }, [formValues]);

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

  // Define types for TypeScript that will be used with dynamic imports
  interface PDFDocumentProxy {
    numPages: number;
    getPage: (pageNumber: number) => Promise<any>;
  }

  interface PDFPageViewport {
    height: number;
    width: number;
  }

  interface PDFPageRenderParams {
    canvasContext: CanvasRenderingContext2D;
    viewport: PDFPageViewport;
    promise?: Promise<void>;
  }

  // Helper function to convert a PDF page to an image
  const pdfPageToImage = async (
    pdfDoc: PDFDocumentProxy,
    pageNumber: number,
  ): Promise<File> => {
    // Load the PDF page
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 }); // Scale to improve readability for OCR

    // Create a canvas to render the PDF page
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page to canvas
    await page.render({
      canvasContext: context!,
      viewport: viewport,
    }).promise;

    // Convert canvas to blob then to File
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to convert PDF page to image"));

          return;
        }
        const file = new File([blob], `page-${pageNumber}.png`, {
          type: "image/png",
        });

        resolve(file);
      }, "image/png");
    });
  };

  // Function to handle multi-page PDFs
  const processPdfFile = async (file: File): Promise<File[]> => {
    try {
      // Safely load PDF.js in the browser environment only
      let pdfjs: any;

      // Only run this code in the browser
      if (typeof window !== "undefined") {
        // Using a try-catch to handle potential import failures
        try {
          // Dynamic import with type assertion
        } catch (importError) {
          console.error("Error importing PDF.js:", importError);
          throw new Error("Failed to load PDF processing library");
        }
      } else {
        throw new Error(
          "PDF processing is only available in browser environment",
        );
      }

      // Load the PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      // Determine number of pages (capped at MAX_PAGES)
      const MAX_PAGES = 5;
      const numPages = Math.min(pdfDoc.numPages, MAX_PAGES);

      if (pdfDoc.numPages > MAX_PAGES) {
        showNotification(
          "เกินขีดจำกัดหน้า",
          `ไฟล์ PDF มี ${pdfDoc.numPages} หน้า แต่ระบบจะประมวลผลเพียง ${MAX_PAGES} หน้าแรกเท่านั้น`,
          "solid",
          "warning",
        );
      }

      // Convert each page to an image
      const pageFiles: File[] = [];

      for (let i = 1; i <= numPages; i++) {
        const pageFile = await pdfPageToImage(pdfDoc, i);

        pageFiles.push(pageFile);
      }

      return pageFiles;
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw error;
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

      // Process all files, handling multi-page PDFs
      let processedFiles: FileData[] = [];

      for (const file of validFiles) {
        if (file.type === "application/pdf") {
          // Process multi-page PDF
          try {
            const pageFiles = await processPdfFile(file);
            const pdfPages = pageFiles.map((pageFile, index) => {
              const url = URL.createObjectURL(pageFile);

              return {
                url,
                name: `${file.name.replace(".pdf", "")}_page${index + 1}.png`,
                size: pageFile.size,
                type: pageFile.type,
                file: pageFile,
                isProcessing: false,
                isOcrProcessed: false,
                isOcrAccepted: false,
                originalFile: file.name, // Track the original PDF file name
                pageNumber: index + 1,
                totalPages: pageFiles.length,
              };
            });

            processedFiles = [...processedFiles, ...pdfPages];
          } catch (error) {
            console.error("Error processing PDF file:", error);
            showNotification(
              "เกิดข้อผิดพลาด",
              `ไม่สามารถประมวลผลไฟล์ PDF: ${file.name}`,
              "solid",
              "danger",
            );
          }
        } else {
          // Normal image file
          const url = URL.createObjectURL(file);

          processedFiles.push({
            url,
            name: file.name,
            size: file.size,
            type: file.type,
            file,
            isProcessing: false,
            isOcrProcessed: false,
            isOcrAccepted: false,
          });
        }
      }

      // Add the processed files to the uploaded files state
      setUploadedFiles((prev) => [...prev, ...processedFiles]);

      // Process OCR for each file
      for (const fileData of processedFiles) {
        await processFileWithOcr(fileData);
      }

      showNotification(
        "อัพโหลดสำเร็จ",
        `อัพโหลดและประมวลผลไฟล์สำเร็จ ${processedFiles.length} หน้า`,
        "solid",
        "success",
      );
    } catch (error) {
      console.error("File upload error:", error);
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

      // Automatically apply OCR data once detected
      if (ocrData && Object.keys(ocrData).length > 0) {
        Object.entries(ocrData).forEach(([key, value]) => {
          if (value) {
            setValue(key as keyof DebtFormData, value);
          }
        });

        // Mark file as accepted
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.name === file.name ? { ...f, isOcrAccepted: true } : f,
          ),
        );
      }

      showNotification(
        "OCR สำเร็จ",
        `วิเคราะห์ข้อมูลจาก ${file.name} สำเร็จและกรอกข้อมูลอัตโนมัติแล้ว`,
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

  const viewFilePreview = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const onSubmit = async (data: DebtFormData) => {
    setIsSubmitting(true);
    try {
      await onSave({
        ...data,
        attachments: uploadedFiles.map((file) => ({
          url: file.url,
          name: file.name,
          size: file.size,
          type: file.type,
          isOcrProcessed: file.isOcrProcessed,
          isOcrAccepted: file.isOcrAccepted,
          ocrData: file.ocrData,
        })),
      });

      if (isGuestMode) {
        // For guest mode, save to localStorage
        saveLocalDebt({
          name: data.debtName,
          debtType: data.debtType,
          paymentType: data.paymentType,
          totalAmount: data.totalAmount,
          minimumPayment: data.minimumPayment,
          interestRate: data.interestRate,
          dueDate: data.dueDate,
          paymentStatus: data.paymentStatus,
          currentInstallment: data.currentInstallment,
          totalInstallments: data.totalInstallments,
        });
      }

      showNotification(
        "บันทึกรายการหนี้สำเร็จ",
        "รายการหนี้ถูกบันทึกเรียบร้อยแล้ว",
        "solid",
        "success",
      );

      reset();
      setUploadedFiles([]);
      onClose();
    } catch (error) {
      console.error("Error saving debt:", error);
      showNotification(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่",
        "solid",
        "danger",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="lg"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            เพิ่มรายการหนี้
          </h2>
        </ModalHeader>
        <ModalBody className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <form id="debt-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                  ข้อมูลหนี้
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="debtName"
                    >
                      ชื่อรายการหนี้ <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="debtName"
                      render={({ field }) => (
                        <input
                          {...field}
                          className="w-full border border-yellow-400 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
                          id="debtName"
                          placeholder="เช่น บัตรเครดิต KBank"
                          type="text"
                        />
                      )}
                      rules={{ required: true }}
                    />
                    {errors.debtName && (
                      <p className="text-red-500 text-xs mt-1">
                        กรุณาระบุชื่อรายการหนี้
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="debtType"
                    >
                      ประเภทหนี้ <span className="text-red-500">*</span>
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
                      rules={{ required: true }}
                    />
                    {errors.debtType && (
                      <p className="text-red-500 text-xs mt-1">
                        กรุณาเลือกประเภทหนี้
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="paymentType"
                  >
                    ประเภทการชำระ <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <Controller
                      control={control}
                      name="paymentType"
                      render={({ field }) => (
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              checked={field.value === "revolving"}
                              className="form-radio text-yellow-500 focus:ring-yellow-500"
                              name="paymentType"
                              type="radio"
                              onChange={() => field.onChange("revolving")}
                            />
                            <span className="ml-2">หมุนเวียน</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              checked={field.value === "installment"}
                              className="form-radio text-yellow-500 focus:ring-yellow-500"
                              name="paymentType"
                              type="radio"
                              onChange={() => {
                                field.onChange("installment");
                                // Set default interest rate to 16% when "จ่ายคืนบางส่วน" is selected
                                setValue("interestRate", "16");
                              }}
                            />
                            <span className="ml-2">จ่ายคืนบางส่วน</span>
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Installment details section - only shown when installment is selected */}
                {paymentType === "installment" && (
                  <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      รายละเอียดการผ่อนชำระรายงวด
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
                          htmlFor="currentInstallment"
                        >
                          งวดที่จ่าย <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          control={control}
                          name="currentInstallment"
                          render={({ field }) => (
                            <input
                              {...field}
                              className="w-full border border-yellow-400 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
                              id="currentInstallment"
                              min="1"
                              placeholder="งวดปัจจุบัน เช่น 3"
                              type="number"
                            />
                          )}
                          rules={{ required: paymentType === "installment" }}
                        />
                        {errors.currentInstallment && (
                          <p className="text-red-500 text-xs mt-1">
                            กรุณาระบุงวดที่จ่าย
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
                          htmlFor="totalInstallments"
                        >
                          งวดทั้งหมด <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          control={control}
                          name="totalInstallments"
                          render={({ field }) => (
                            <input
                              {...field}
                              className="w-full border border-yellow-400 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
                              id="totalInstallments"
                              min="1"
                              placeholder="จำนวนงวดทั้งหมด เช่น 12"
                              type="number"
                            />
                          )}
                          rules={{ required: paymentType === "installment" }}
                        />
                        {errors.totalInstallments && (
                          <p className="text-red-500 text-xs mt-1">
                            กรุณาระบุจำนวนงวดทั้งหมด
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="totalAmount"
                    >
                      ยอดหนี้ทั้งหมด (บาท){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="totalAmount"
                      render={({ field }) => (
                        <input
                          {...field}
                          className="w-full border border-yellow-400 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
                          id="totalAmount"
                          placeholder="0.00"
                          step="0.01"
                          type="number"
                        />
                      )}
                      rules={{ required: true }}
                    />
                    {errors.totalAmount && (
                      <p className="text-red-500 text-xs mt-1">
                        กรุณาระบุยอดหนี้ทั้งหมด
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="minimumPayment"
                    >
                      {paymentType === "revolving"
                        ? "ยอดชำระขั้นต่ำ (บาท)"
                        : "ยอดผ่อนต่องวด (บาท)"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="minimumPayment"
                      render={({ field }) => (
                        <input
                          {...field}
                          className="w-full border border-yellow-400 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
                          id="minimumPayment"
                          placeholder="0.00"
                          step="0.01"
                          type="number"
                        />
                      )}
                      rules={{ required: true }}
                    />
                    {errors.minimumPayment && (
                      <p className="text-red-500 text-xs mt-1">
                        กรุณาระบุยอดชำระขั้นต่ำ
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="interestRate"
                    >
                      อัตราดอกเบี้ย (% ต่อปี)
                    </label>
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
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="dueDate"
                    >
                      วันครบกำหนดชำระ <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="dueDate"
                      render={({ field }) => (
                        <input
                          {...field}
                          className="w-full border border-yellow-400 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
                          id="dueDate"
                          placeholder="ทุกวันที่ 15"
                          type="text"
                        />
                      )}
                      rules={{ required: true }}
                    />
                    {errors.dueDate && (
                      <p className="text-red-500 text-xs mt-1">
                        กรุณาระบุวันครบกำหนดชำระ
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="paymentStatus"
                  >
                    สถานะการชำระ <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <CustomSelect
                        ariaLabel="เลือกสถานะการชำระ"
                        id="paymentStatus"
                        options={paymentStatusOptions}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                    rules={{ required: true }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                  เอกสารหนี้
                </h3>
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
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalFooter className="px-6 py-4 border-t border-gray-200">
          <div className="flex gap-3 ml-auto">
            <Button type="button" variant="flat" onPress={onClose}>
              ยกเลิก
            </Button>
            <Button
              className={
                !isValid || !allFieldsValid.current ? "opacity-50" : ""
              }
              color="primary"
              disabled={!isValid || isSubmitting || !allFieldsValid.current}
              form="debt-form"
              isLoading={isSubmitting}
              startContent={<FiSave />}
              type="submit"
            >
              บันทึกรายการหนี้
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DebtFormModal;
