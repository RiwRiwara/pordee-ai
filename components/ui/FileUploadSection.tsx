// components/ui/FileUploadSection.tsx
import React from "react";
import { Button } from "@heroui/button";
import { FaUpload, FaWallet, FaFileAlt } from "react-icons/fa";

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

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <FaWallet
          className={`mr-2 ${isIncome ? "text-green-500" : "text-yellow-500"}`}
          size={18}
        />
        {isIncome ? "เอกสารรายได้" : "เอกสารรายจ่าย"}
      </h3>

      <div className="flex justify-end mb-3">
        <input
          ref={fileInputRef}
          multiple
          accept="image/png,image/jpeg,image/jpg,application/pdf"
          aria-label={`อัพโหลดไฟล์${isIncome ? "สลิปหรือเอกสารรายได้" : "บิลหรือเอกสารรายจ่าย"}`}
          className="hidden"
          type="file"
          onChange={(e) => handleFileChange(e, fileType)}
        />
        <Button
          className={`bg-${themeColor}-500 text-white hover:bg-${themeColor}-600`}
          color={isIncome ? "success" : "warning"}
          isLoading={isUploading}
          startContent={<FaUpload className="mr-1" size={14} />}
          onPress={triggerFileUpload}
        >
          {isIncome ? "อัพโหลดสลิปเงินเดือน" : "อัพโหลดบิล/ใบเสร็จ"}
        </Button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FaFileAlt
                className={isIncome ? "text-green-500" : "text-yellow-500"}
              />
              <h4 className="font-medium text-sm">
                ไฟล์{isIncome ? "รายได้" : "รายจ่าย"} ({uploadedFiles.length})
              </h4>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {uploadedFiles.map((file, index) => (
                <FileItem
                  key={index}
                  acceptOcrRecommendation={acceptOcrRecommendation}
                  file={file}
                  fileType={fileType}
                  index={index}
                  isProcessingOcr={isProcessingOcr}
                  rejectOcrRecommendation={rejectOcrRecommendation}
                  removeFile={removeFile}
                  viewFilePreview={viewFilePreview}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
