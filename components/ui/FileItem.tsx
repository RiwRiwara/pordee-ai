// components/ui/FileItem.tsx
import React from "react";
import { FaFileAlt, FaEye, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

import { FileData } from "./types";

interface FileItemProps {
  file: FileData;
  index: number;
  fileType: "income" | "expense";
  isProcessingOcr: boolean;
  viewFilePreview: (file: FileData) => void;
  removeFile: (index: number) => void;
  acceptOcrRecommendation: (file: FileData) => void;
  rejectOcrRecommendation: (file: FileData) => void;
}

const formatNumber = (num?: number) => {
  if (num === undefined) return "---";

  return num.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const FileItem: React.FC<FileItemProps> = ({
  file,
  index,
  fileType,
  isProcessingOcr,
  viewFilePreview,
  removeFile,
  acceptOcrRecommendation,
  rejectOcrRecommendation,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 mb-2 hover:border-gray-300 transition-all">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div>
            {file.type.startsWith("image/") ? (
              <FaFileAlt className="text-blue-500" size={16} />
            ) : (
              <FaFileAlt className="text-red-500" size={16} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>

        {file.isProcessing ? (
          <div className="mt-1 flex items-center text-xs text-blue-500">
            <Spinner className="mr-1" size="sm" /> กำลังวิเคราะห์...
          </div>
        ) : file.isOcrProcessed ? (
          <div className="mt-1 text-xs bg-gray-50 p-1.5 rounded border border-gray-100">
            <p>
              <span className="font-medium">หมวดหมู่:</span>{" "}
              <span
                className={
                  file.ocrCategory === "income"
                    ? "text-green-600"
                    : file.ocrCategory === "expense"
                      ? "text-yellow-600"
                      : "text-gray-600"
                }
              >
                {file.ocrCategory === "income"
                  ? "รายได้"
                  : file.ocrCategory === "expense"
                    ? "รายจ่าย"
                    : "ไม่ระบุ"}
              </span>
            </p>
            <p>
              <span className="font-medium">จำนวนเงิน:</span>{" "}
              <span className="text-gray-900">
                ฿{formatNumber(file.ocrAmount)}
              </span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          aria-label={`ดูตัวอย่างไฟล์ ${file.name}`}
          className="min-w-0 px-2 text-blue-500 hover:bg-blue-100"
          isDisabled={isProcessingOcr}
          size="sm"
          variant="light"
          onPress={() => viewFilePreview(file)}
        >
          <FaEye size={14} />
        </Button>

        {file.isOcrProcessed && !file.isOcrAccepted && (
          <>
            <Button
              aria-label={`ยอมรับคำแนะนำ OCR สำหรับ ${file.name}`}
              className="min-w-0 px-2 text-green-500 hover:bg-green-100"
              isDisabled={isProcessingOcr}
              size="sm"
              variant="light"
              onPress={() => acceptOcrRecommendation(file)}
            >
              <FaCheck size={14} />
            </Button>
            <Button
              aria-label={`ปฏิเสธคำแนะนำ OCR สำหรับ ${file.name}`}
              className="min-w-0 px-2 text-red-500 hover:bg-red-100"
              isDisabled={isProcessingOcr}
              size="sm"
              variant="light"
              onPress={() => rejectOcrRecommendation(file)}
            >
              <FaTimes size={14} />
            </Button>
          </>
        )}

        <Button
          aria-label={`ลบไฟล์ ${file.name}`}
          className="min-w-0 px-2 text-red-500 hover:bg-red-100"
          isDisabled={isProcessingOcr}
          size="sm"
          variant="light"
          onPress={() => removeFile(index)}
        >
          <FaTrash size={14} />
        </Button>
      </div>
    </div>
  );
};

export default FileItem;
