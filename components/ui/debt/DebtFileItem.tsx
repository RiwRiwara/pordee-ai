// components/ui/debt/DebtFileItem.tsx
import React from "react";
import { FaFileAlt, FaCheck, FaTimesCircle } from "react-icons/fa";

import { FileData } from "./types";

interface DebtFileItemProps {
  file: FileData;
  index: number;
  isProcessingOcr: boolean;
  removeFile: (index: number) => void;
  acceptOcrRecommendation: (file: FileData) => void;
  rejectOcrRecommendation: (file: FileData) => void;
}

const DebtFileItem: React.FC<DebtFileItemProps> = ({
  file,
  index,
  isProcessingOcr,
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
            {file.isOcrProcessed && file.ocrData && (
              <span className="text-xs text-green-600 truncate">
                {file.ocrData.debtName}: ฿{file.ocrData.totalAmount}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-1 ml-2">
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

export default DebtFileItem;
