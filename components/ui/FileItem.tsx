// components/ui/FileItem.tsx
import React from "react";
import { FaFileAlt, FaEye, FaCheck, FaTimesCircle } from "react-icons/fa";

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
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-2 text-sm hover:bg-gray-100 transition">
      <div className="flex items-center flex-1 min-w-0">
        <div className="mr-2">
          {file.type.startsWith("image/") ? (
            <FaFileAlt className="text-blue-500" size={14} />
          ) : (
            <FaFileAlt className="text-red-500" size={14} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <span className="text-xs font-medium truncate max-w-[150px]">
              {file.name}
            </span>
            {file.isOcrProcessed && (
              <span className="text-xs text-green-600 truncate">
                {file.ocrCategory === "income"
                  ? "รายได้"
                  : file.ocrCategory === "expense"
                    ? "รายจ่าย"
                    : "ไม่ระบุ"}
                : ฿{file.ocrAmount?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-1 ml-2">
        <button
          aria-label="ดูตัวอย่าง"
          className="text-blue-500 hover:text-blue-700 p-1"
          disabled={isProcessingOcr}
          title="ดูตัวอย่าง"
          type="button"
          onClick={() => viewFilePreview(file)}
        >
          <FaEye size={12} />
        </button>
        {file.isOcrProcessed && !file.isOcrAccepted && (
          <>
            <button
              aria-label="ยอมรับคำแนะนำ"
              className="text-green-500 hover:text-green-700 p-1"
              disabled={isProcessingOcr}
              title="ยอมรับคำแนะนำ"
              type="button"
              onClick={() => acceptOcrRecommendation(file)}
            >
              <FaCheck size={12} />
            </button>
            <button
              aria-label="ปฏิเสธคำแนะนำ"
              className="text-red-500 hover:text-red-700 p-1"
              disabled={isProcessingOcr}
              title="ปฏิเสธคำแนะนำ"
              type="button"
              onClick={() => rejectOcrRecommendation(file)}
            >
              <FaTimesCircle size={12} />
            </button>
          </>
        )}
        <button
          aria-label="ลบไฟล์"
          className="text-red-500 hover:text-red-700 p-1"
          title="ลบไฟล์"
          type="button"
          onClick={() => removeFile(index)}
        >
          <FaTimesCircle size={12} />
        </button>
      </div>
    </div>
  );
};

export default FileItem;
