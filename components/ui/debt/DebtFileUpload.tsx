// components/ui/debt/DebtFileUpload.tsx
import React from "react";
import { Button } from "@heroui/button";
import { FiUpload } from "react-icons/fi";

import DebtFileItem from "./DebtFileItem";
import { DebtFileUploadProps } from "./types";

const DebtFileUpload: React.FC<DebtFileUploadProps> = ({
  uploadedFiles,
  isUploading,
  isProcessingOcr,
  fileInputRef,
  triggerFileUpload,
  handleFileChange,
  removeFile,
  acceptOcrRecommendation,
  rejectOcrRecommendation,
}) => {
  return (
    <div className="mb-6">
      <input
        ref={fileInputRef}
        multiple
        accept="image/png, image/jpeg, image/jpg, application/pdf"
        aria-label="อัพโหลดไฟล์สลิปหรือใบเสร็จ"
        className="hidden"
        type="file"
        onChange={handleFileChange}
      />
      <Button
        className="bg-blue-500 text-white w-full flex items-center justify-center py-3 hover:bg-blue-600"
        color="primary"
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
        อัพโหลดสลิป / ใบเสร็จ
      </Button>
      <p className="text-xs text-center text-gray-500 mt-1">
        อัพโหลดสลิป / ใบเสร็จ ระบบจะอ่านข้อมูลหนี้ให้อัตโนมัติ
      </p>
      <p className="text-xs text-center text-gray-500">
        รองรับ PDF หลายหน้า และรูปภาพ (สูงสุด 5 หน้า)
      </p>

      {uploadedFiles.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">
            ไฟล์ที่อัพโหลด ({uploadedFiles.length})
          </h4>
          <div className="max-h-40 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <DebtFileItem
                key={index}
                acceptOcrRecommendation={acceptOcrRecommendation}
                file={file}
                index={index}
                isProcessingOcr={isProcessingOcr}
                rejectOcrRecommendation={rejectOcrRecommendation}
                removeFile={removeFile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtFileUpload;
