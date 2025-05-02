import React from "react";
import { Button } from "@heroui/button";
import { FiX } from "react-icons/fi";

import { DebtItem } from "../types";

interface DebtDetailModalProps {
  selectedDebt: DebtItem;
  formatNumber: (num: number) => string;
  onClose: () => void;
  onEdit: (debt: DebtItem) => void;
  onDelete: (debtId: string) => Promise<void>;
  refreshDebts: () => void;
}

export default function DebtDetailModal({
  selectedDebt,
  formatNumber,
  onClose,
  onEdit,
  onDelete,
  refreshDebts,
}: DebtDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <Button
          className="absolute right-4 top-4 rounded-full"
          size="sm"
          variant="ghost"
          onPress={onClose}
        >
          <FiX size={24} />
        </Button>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedDebt.name}
          </h2>
          <div className="mt-1 inline-block rounded-md bg-gray-100 px-2 py-1 text-sm">
            {selectedDebt.debtType}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">วงเงินทั้งหมด</p>
              <p className="text-lg font-semibold text-[#3776C1]">
                {formatNumber(selectedDebt.totalAmount || 0)} THB
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ยอดคงเหลือ</p>
              <p className="text-lg font-semibold">
                {formatNumber(selectedDebt.remainingAmount || 0)} THB
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">อัตราดอกเบี้ย</p>
              <p className="text-lg font-semibold">
                {selectedDebt.interestRate || 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ค่างวด/เดือน</p>
              <p className="text-lg font-semibold">
                {formatNumber(selectedDebt.minimumPayment || 0)} THB
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">วันที่ชำระ</p>
            <p className="font-medium">
              {selectedDebt.paymentDueDay || 1} ของทุกเดือน
            </p>
          </div>

          {selectedDebt.startDate && (
            <div>
              <p className="text-sm text-gray-500">วันที่เริ่มหนี้</p>
              <p className="font-medium">
                {new Date(selectedDebt.startDate as string).toLocaleDateString(
                  "th-TH",
                )}
              </p>
            </div>
          )}

          {selectedDebt.estimatedPayoffDate && (
            <div>
              <p className="text-sm text-gray-500">วันที่คาดว่าจะชำระหมด</p>
              <p className="font-medium">
                {new Date(
                  selectedDebt.estimatedPayoffDate as string,
                ).toLocaleDateString("th-TH")}
              </p>
            </div>
          )}

          {selectedDebt.notes && (
            <div>
              <p className="text-sm text-gray-500">หมายเหตุ</p>
              <p className="whitespace-pre-line rounded-md bg-gray-50 p-3">
                {selectedDebt.notes}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            color="danger"
            variant="ghost"
            onPress={() => {
              if (window.confirm("คุณต้องการลบรายการหนี้นี้ใช่หรือไม่?")) {
                onDelete(selectedDebt._id)
                  .then(() => {
                    onClose();
                    refreshDebts();
                  })
                  .catch((error: Error) => {
                    console.error("Error deleting debt:", error);
                  });
              }
            }}
          >
            ลบรายการ
          </Button>
          <Button
            color="primary"
            onPress={() => {
              onClose();
              onEdit(selectedDebt);
            }}
          >
            แก้ไข
          </Button>
        </div>
      </div>
    </div>
  );
}
