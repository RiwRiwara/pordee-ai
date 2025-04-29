// components/ui/FileUploadSection.tsx
import React from "react";
import { Button } from "@heroui/button";
import { FaUpload, FaWallet } from "react-icons/fa";

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
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
        <FaWallet
          className={`mr-2 ${fileType === "income" ? "text-green-500" : "text-yellow-500"}`}
          size={16}
        />
        {fileType === "income" ? "รายได้" : "รายจ่าย"}
      </h3>

      <div className="flex justify-end mb-2">
        <input
          ref={fileInputRef}
          multiple
          accept="image/png, image/jpeg, image/jpg, application/pdf"
          aria-label={`อัพโหลดไฟล์${fileType === "income" ? "สลิปหรือเอกสารรายได้" : "บิลหรือเอกสารรายจ่าย"}`}
          className="hidden"
          type="file"
          onChange={(e) => handleFileChange(e, fileType)}
        />
        <Button
          className="h-8 bg-blue-500 text-white hover:bg-blue-600"
          color="primary"
          isLoading={isUploading}
          size="sm"
          startContent={<FaUpload className="mr-1" size="12" />}
          variant="flat"
          onPress={triggerFileUpload}
        >
          {fileType === "income" ? "อัพโหลดสลิปเงินเดือน" : "อัพโหลดบิล"}
        </Button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">
            ไฟล์{fileType === "income" ? "รายได้" : "รายจ่าย"} (
            {uploadedFiles.length})
          </h4>
          <div className="max-h-40 overflow-y-auto">
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
      )}
    </div>
  );
};

export default FileUploadSection;
