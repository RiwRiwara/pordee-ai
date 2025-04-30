import React, { useState } from "react";
import { Button } from "@heroui/button";
import { FiEdit, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

import DebtModal from "./DebtModal";
import { DebtItem } from "./types";

interface AllDebtSectionProps {
  debts: DebtItem[];
  onAddDebt: () => void;
}

export default function AllDebtSection({
  debts = [],
  onAddDebt,
}: AllDebtSectionProps) {
  const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Format with commas for display
  const formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Open the debt details modal
  const openDetailModal = (debt: DebtItem) => {
    setSelectedDebt(debt);
    setIsDetailModalOpen(true);
  };

  // Open the edit debt modal
  const openEditModal = (debt: DebtItem) => {
    setSelectedDebt(debt);
    setIsDebtModalOpen(true);
  };

  // Close all modals
  const closeAllModals = () => {
    setIsDebtModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedDebt(null);
  };

  // Handler for debt edit
  const handleSaveDebt = async (debtData: any) => {
    if (!selectedDebt) return;

    try {
      // Ensure all required fields are properly formatted according to API requirements
      const formattedData = {
        // Required fields
        name: debtData.name,
        debtType: debtData.debtType,
        totalAmount:
          typeof debtData.totalAmount === "number"
            ? debtData.totalAmount
            : parseFloat(debtData.totalAmount || "0"),
        remainingAmount:
          typeof debtData.remainingAmount === "number"
            ? debtData.remainingAmount
            : parseFloat(debtData.remainingAmount || "0"),
        interestRate:
          typeof debtData.interestRate === "number"
            ? debtData.interestRate
            : parseFloat(debtData.interestRate || "0"),
        paymentDueDay:
          typeof debtData.paymentDueDay === "number"
            ? debtData.paymentDueDay
            : parseInt(debtData.paymentDueDay || "1"),

        // Optional fields with fallbacks
        minimumPayment:
          typeof debtData.minimumPayment === "number"
            ? debtData.minimumPayment
            : parseFloat(debtData.minimumPayment || "0"),
        startDate: debtData.startDate || undefined,
        estimatedPayoffDate: debtData.estimatedPayoffDate || undefined,
        notes: debtData.notes || "",
        attachments: debtData.attachments || selectedDebt.attachments || [],
      };

      const response = await fetch(`/api/debts/${selectedDebt._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "ไม่สามารถอัปเดตข้อมูลหนี้ได้");
      }

      await response.json();
    } catch (error) {
      throw error;
    }
  };

  // Handler for debt deletion
  const handleDeleteDebt = async (debtId: string) => {
    try {
      const response = await fetch(`/api/debts/${debtId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "ไม่สามารถลบข้อมูลหนี้ได้");
      }

      await response.json();
    } catch (error) {
      throw error;
    }
  };

  // Handler to refresh debts after edit/delete
  const refreshDebts = () => {
    toast.success("อัปเดตข้อมูลเรียบร้อย");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Show loading state when no debts are available yet
  if (debts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">หนี้ทั้งหมด</h2>
          <Button color="primary" size="sm" onPress={onAddDebt}>
            <span className="mr-1">+</span>
            เพิ่มหนี้
          </Button>
        </div>
        <p className="text-gray-500 text-center py-6">
          ไม่พบรายการหนี้ กรุณาเพิ่มหนี้เพื่อวางแผน
        </p>
      </div>
    );
  }

  // Filter based on debtType Thai values
  const revolving = debts.filter(
    (debt) =>
      debt.debtType === "บัตรเครดิต" ||
      debt.originalPaymentType === "revolving" ||
      debt.originalPaymentType === "credit_card" ||
      debt.originalPaymentType === "cash_card",
  );

  const installment = debts.filter(
    (debt) =>
      debt.debtType === "สินเชื่อ" ||
      debt.originalPaymentType === "installment" ||
      debt.originalPaymentType === "loan" ||
      debt.originalPaymentType === "mortgage",
  );

  const otherDebts = debts.filter(
    (debt) => debt.debtType === "อื่นๆ" && !debt.originalPaymentType,
  );

  if (otherDebts.length > 0) {
    installment.push(...otherDebts);
  }

  return (
    <div className="flex flex-col gap-4">
      <hr className="border border-gray-200 my-2" />
      <div className="bg-[#3776C1] rounded-full p-2 text-center items-center">
        <h2 className="text-lg font-semibold text-white">รายการหนี้ของฉัน</h2>
      </div>

      {/* Revolving Debt */}
      <h2 className="mb-0 text-lg font-semibold text-[#3776C1]">
        หนี้หมุนเวียน (Revolving Debt)
      </h2>
      <div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
          {revolving.map((debt) => (
            <div
              key={debt._id}
              className="mb-3 rounded-lg bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{debt.name}</h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">วันที่ชำระ:</span>
                    <span className="ml-1 text-sm font-medium">
                      {debt.paymentDueDay} ทุกเดือน
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#3776C1]">
                    {formatNumber(debt.remainingAmount)} THB
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">ขั้นต่ำต่อเดือน:</p>
                  <p className="font-medium text-yellow-600">
                    {formatNumber(debt.minimumPayment || 0)} THB
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-8 items-center justify-center rounded-md bg-blue-500 px-3 text-white">
                    <p className="text-sm font-bold">{debt.interestRate}%</p>
                  </div>
                  <Button
                    className="px-2"
                    color="primary"
                    size="sm"
                    variant="ghost"
                    onPress={() => openEditModal(debt)}
                  >
                    <FiEdit size={18} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Installment Debt Section */}
      <h2 className="mb-0 mt-2 text-lg font-semibold text-[#3776C1]">
        หนี้ส่งผ่อน (Installment Debt)
      </h2>
      <div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
          {installment.map((debt) => (
            <div
              key={debt._id}
              className="mb-3 rounded-lg bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{debt.name}</h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">วันที่ชำระ:</span>
                    <span className="ml-1 text-sm font-medium">
                      {debt.paymentDueDay} ทุกเดือน
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#3776C1]">
                    {formatNumber(debt.remainingAmount)} THB
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">ค่าผ่อนต่อเดือน:</p>
                  <p className="font-medium text-yellow-600">
                    {formatNumber(debt.minimumPayment || 0)} THB
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-8 items-center justify-center rounded-md bg-green-500 px-3 text-white">
                    <p className="text-sm font-bold">{debt.interestRate}%</p>
                  </div>
                  <Button
                    className="px-2"
                    color="primary"
                    size="sm"
                    variant="ghost"
                    onPress={() => openEditModal(debt)}
                  >
                    <FiEdit size={18} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          className="mt-4 w-full border border-dashed border-gray-300 py-6 text-gray-500"
          variant="flat"
          onPress={onAddDebt}
        >
          + เพิ่มรายการหนี้
        </Button>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <Button
              className="absolute right-4 top-4 rounded-full"
              size="sm"
              variant="ghost"
              onPress={closeAllModals}
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
                    {new Date(
                      selectedDebt.startDate as string,
                    ).toLocaleDateString("th-TH")}
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
                  if (
                    window.confirm("คุณต้องการลบรายการหนี้นี้ใช่หรือไม่?") &&
                    selectedDebt
                  ) {
                    handleDeleteDebt(selectedDebt._id)
                      .then(() => {
                        closeAllModals();
                        refreshDebts();
                      })
                      .catch((error) => {
                        toast.error(error.message);
                      });
                  }
                }}
              >
                ลบรายการ
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  closeAllModals();
                  openEditModal(selectedDebt);
                }}
              >
                แก้ไข
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Debt Modal */}
      <DebtModal
        isOpen={isDebtModalOpen}
        refreshDebts={refreshDebts}
        selectedDebt={selectedDebt}
        onClose={closeAllModals}
        onDeleteDebt={handleDeleteDebt}
        onSaveDebt={handleSaveDebt}
      />
    </div>
  );
}
