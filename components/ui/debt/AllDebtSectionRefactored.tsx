import React, { useState } from "react";
import { Button } from "@heroui/button";
import toast from "react-hot-toast";

import DebtModal from "../DebtModal";
import { DebtItem } from "../types";
import { DebtCategory } from "@/types/debt";

import DebtTypeSection from "./DebtTypeSection";
import DebtDetailModal from "./DebtDetailModal";
import {
  groupDebtsByCategory,
  formatNumber,
  calculateTotalAmount,
  calculatePercentage,
} from "./DebtUtils";

interface AllDebtSectionProps {
  debts: DebtItem[];
  onAddDebt: () => void;
  totalMonthlyIncome?: number; // Optional total monthly income for DTI calculation
}

export default function AllDebtSection({
  debts = [],
  onAddDebt,
  totalMonthlyIncome = 0, // Default to 0 if not provided
}: AllDebtSectionProps) {
  const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  // Group debts by category using the enhanced categorization system
  const debtsByCategory = groupDebtsByCategory(debts);

  // Calculate summary metrics
  const totalRemainingDebt = calculateTotalAmount(debts, "remainingAmount");
  const totalMinimumPayment = calculateTotalAmount(debts, "minimumPayment");

  // Calculate percentages for each category
  const categoryPercentages = Object.entries(debtsByCategory)
    .map(([category, categoryDebts]) => {
      const categoryTotal = calculateTotalAmount(
        categoryDebts,
        "remainingAmount",
      );
      const percentage = calculatePercentage(categoryTotal, totalRemainingDebt);

      return {
        category: category as DebtCategory,
        total: categoryTotal,
        percentage,
        count: categoryDebts.length,
      };
    })
    .filter((item) => item.count > 0); // Only include categories with debts

  // Calculate Debt-to-Income ratio
  const debtToIncomeRatio =
    totalMonthlyIncome > 0
      ? (totalMinimumPayment / totalMonthlyIncome) * 100
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <hr className="border border-gray-200 my-2" />
      <div className="bg-[#3776C1] rounded-t-full rounded-b-md p-2 text-center items-center">
        <h2 className="text-lg font-semibold text-white">รายการหนี้ของฉัน</h2>
      </div>

      {/* Debt Categories */}
      <div className="space-y-4">
        {/* 1. บัตรเครดิต (Credit Card) */}
        <DebtTypeSection
          debts={debtsByCategory[DebtCategory.CreditCard]}
          formatNumber={formatNumber}
          interestRateColor="bg-blue-600"
          title="บัตรเครดิต (Credit Card)"
          onEdit={openEditModal}
        />
        
        {/* 2. หนี้สินหมุนเวียน (Revolving Debt) */}
        <DebtTypeSection
          debts={debtsByCategory[DebtCategory.RevolvingDebt]}
          formatNumber={formatNumber}
          interestRateColor="bg-blue-500"
          title="หนี้สินหมุนเวียน (Revolving Debt)"
          onEdit={openEditModal}
        />

        {/* 3. หนี้สินผ่อนสินค้า (Product Installment) */}
        <DebtTypeSection
          debts={debtsByCategory[DebtCategory.ProductInstallment]}
          formatNumber={formatNumber}
          interestRateColor="bg-green-500"
          title="หนี้สินผ่อนสินค้า (Product Installment)"
          onEdit={openEditModal}
        />

        {/* 4. สินเชื่อส่วนบุคคล (Personal Loan) */}
        <DebtTypeSection
          debts={debtsByCategory[DebtCategory.PersonalLoan]}
          formatNumber={formatNumber}
          interestRateColor="bg-purple-500"
          title="สินเชื่อส่วนบุคคล (Personal Loan)"
          onEdit={openEditModal}
        />

        {/* 5. สินเชื่อที่อยู่อาศัย (Housing Loan) */}
        <DebtTypeSection
          debts={debtsByCategory[DebtCategory.HousingLoan]}
          formatNumber={formatNumber}
          interestRateColor="bg-indigo-500"
          title="สินเชื่อที่อยู่อาศัย (Housing Loan)"
          onEdit={openEditModal}
        />

        {/* 6. สินเชื่อรถยนต์ (Vehicle Loan) */}
        <DebtTypeSection
          debts={debtsByCategory[DebtCategory.VehicleLoan]}
          formatNumber={formatNumber}
          interestRateColor="bg-cyan-500"
          title="สินเชื่อรถยนต์ (Vehicle Loan)"
          onEdit={openEditModal}
        />
        
        {/* 7. สินเชื่อธุรกิจ (Business Loan) */}
        <DebtTypeSection
          debts={debtsByCategory[DebtCategory.BusinessLoan]}
          formatNumber={formatNumber}
          interestRateColor="bg-amber-500"
          title="สินเชื่อธุรกิจ (Business Loan)"
          onEdit={openEditModal}
        />

        {/* 8. เงินกู้นอกระบบ (Informal Loan) */}
        <DebtTypeSection
          debts={debtsByCategory[DebtCategory.InformalLoan]}
          formatNumber={formatNumber}
          interestRateColor="bg-red-500"
          title="เงินกู้นอกระบบ (Informal Loan)"
          onEdit={openEditModal}
        />

        {/* Other Debts */}
        <DebtTypeSection
          debts={debtsByCategory[DebtCategory.Other]}
          formatNumber={formatNumber}
          interestRateColor="bg-gray-500"
          title="หนี้อื่นๆ (Other Debts)"
          onEdit={openEditModal}
        />
      </div>

      {/* Add Debt Button */}
      <Button
        className="mt-4 w-full border border-dashed border-gray-300 py-6 text-gray-500 hover:bg-gray-50 transition-colors"
        variant="flat"
        onPress={onAddDebt}
      >
        + เพิ่มรายการหนี้
      </Button>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedDebt && (
        <DebtDetailModal
          formatNumber={formatNumber}
          refreshDebts={refreshDebts}
          selectedDebt={selectedDebt}
          onClose={closeAllModals}
          onDelete={handleDeleteDebt}
          onEdit={openEditModal}
        />
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
