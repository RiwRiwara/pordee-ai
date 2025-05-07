// components/ui/FileUploadSection.tsx
import React from "react";
import { Button } from "@heroui/button";
import { FaWallet } from "react-icons/fa";

import FileItem from "./FileItem";
import { FileUploadSectionProps } from "./types";

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  fileType,
  uploadedFiles,
  setUploadedFiles,
  isUploading,
  setIsUploading,
  isProcessingOcr,
  fileInputRef,
  triggerFileUpload,
  handleFileChange,
  processFileWithOcr,
  viewFilePreview,
  removeFile,
  acceptOcrRecommendation,
  rejectOcrRecommendation,
}) => {
  const isIncome = fileType === "income";
  const themeColor = isIncome ? "green" : "yellow";
  const bgColor = isIncome ? "bg-green-500" : "bg-yellow-500";
  const hoverColor = isIncome ? "hover:bg-green-600" : "hover:bg-yellow-600";
  const borderColor = isIncome ? "border-green-200" : "border-yellow-200";
  const lightBgColor = isIncome ? "bg-green-50" : "bg-yellow-50";

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <FaWallet
          className={`mr-2 ${isIncome ? "text-green-500" : "text-yellow-500"}`}
          size={18}
        />
        {isIncome ? "เอกสารรายได้" : "เอกสารรายจ่าย"}
      </h3>

      <input
        ref={fileInputRef}
        multiple
        accept="image/png,image/jpeg,image/jpg,application/pdf"
        aria-label={`อัพโหลดไฟล์${isIncome ? "สลิปหรือเอกสารรายได้" : "บิลหรือเอกสารรายจ่าย"}`}
        className="hidden"
        type="file"
        onChange={(e) => handleFileChange(e, fileType)}
      />

      <div
        className={`border ${borderColor} rounded-lg p-4 ${lightBgColor} mb-4`}
      >
        <Button
          className={`${bgColor} text-white w-full flex items-center justify-center py-3 ${hoverColor}`}
          color={themeColor === "green" ? "success" : "warning"}
          isLoading={isUploading}
          startContent={
            <svg
              fill="none"
              height="20"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          }
          onPress={triggerFileUpload}
        >
          {isIncome
            ? "อัพโหลดสลิปเงินเดือนหรือเอกสารรายได้"
            : "อัพโหลดบิลหรือเอกสารรายจ่าย"}
        </Button>
        <p className="text-xs text-center text-gray-600 mt-2">
          อัพโหลด
          {isIncome
            ? "สลิปเงินเดือนหรือเอกสารรายได้"
            : "บิลหรือเอกสารรายจ่าย"}{" "}
          ระบบจะอ่านข้อมูลให้อัตโนมัติ
        </p>
        <p className="text-xs text-center text-gray-600">
          รองรับไฟล์ PDF และรูปภาพ (PNG, JPEG) ขนาดไม่เกิน 10MB
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">
            ไฟล์ที่อัพโหลด ({uploadedFiles.length})
          </h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {uploadedFiles.map((file, index) => (
              <FileItem
                key={index}
                acceptOcrRecommendation={() => acceptOcrRecommendation(file)}
                file={file}
                fileType={fileType}
                index={index}
                isProcessingOcr={isProcessingOcr}
                rejectOcrRecommendation={() => rejectOcrRecommendation(file)}
                removeFile={() => removeFile(index)}
                viewFilePreview={() => viewFilePreview(file)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
