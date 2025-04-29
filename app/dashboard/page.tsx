"use client";

import React, { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import BackButton from "@/components/ui/BackButton";
import DebtFormModal from "@/components/ui/debt/DebtFormModal";
import IncomeExpenseModal from "@/components/ui/IncomeExpenseModal";
import RiskMeter from "@/components/ui/RiskMeter";
import { useCustomToast } from "@/components/ui/ToastNotification";
import IncomeExpenseSection from "@/components/ui/IncomeExpenseSection";
import AllDebtSection from "@/components/ui/AllDebtSection";
import SummarySection from "@/components/ui/SummarySection";
import PlanSection from "@/components/ui/PlanSection";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState("0.00");
  const [monthlyExpense, setMonthlyExpense] = useState("0.00");
  const [disposableIncome, setDisposableIncome] = useState("0.00");
  const [isDebtFormOpen, setIsDebtFormOpen] = useState(false);
  const [isIncomeExpenseDrawerOpen, setIsIncomeExpenseDrawerOpen] =
    useState(false);
  const [debtRiskPercentage, setDebtRiskPercentage] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<
    "quick" | "save" | "balanced" | null
  >(null);
  const [debts, setDebts] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [debtSummary, setDebtSummary] = useState({
    totalDebts: 0,
    totalAmount: "0.00",
    monthlyPayment: "0.00",
    interestRate: "0%",
  });
  const { showNotification } = useCustomToast();

  // Calculate debt risk percentage based on debt-to-income ratio
  const calculateDebtRiskPercentage = () => {
    // Parse income and get total monthly debt payments
    const income = parseFloat(monthlyIncome.replace(/,/g, ""));

    // Calculate total monthly debt payments
    let totalMonthlyDebtPayment = 0;

    debts.forEach((debt) => {
      if (debt.installmentAmount) {
        totalMonthlyDebtPayment += parseFloat(
          debt.installmentAmount.replace(/,/g, ""),
        );
      }
    });

    // Calculate debt-to-income ratio (DTI)
    let debtToIncomeRatio = 0;

    if (income > 0) {
      debtToIncomeRatio = (totalMonthlyDebtPayment / income) * 100;
    }

    // Cap at 100%
    const riskPercentage = Math.min(Math.round(debtToIncomeRatio), 100);

    setDebtRiskPercentage(riskPercentage);
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Load data when component mounts or auth state changes
  useEffect(() => {
    loadUserData();
  }, [isAuthenticated, isLoading, user]);

  // Load all user financial data
  const loadUserData = async () => {
    try {
      if (!isAuthenticated && !isLoading) {
        // If not authenticated and not loading, we may be in guest mode
        // Could load from localStorage here if desired
        setIsLoaded(true);

        return;
      }

      if (!isAuthenticated) return; // Still loading or not authenticated

      // Fetch financial data
      const financeResponse = await fetch("/api/finance");

      if (financeResponse.ok) {
        const { finance } = await financeResponse.json();

        if (finance) {
          // Format values for display
          setMonthlyIncome(formatCurrency(finance.monthlyIncome));
          setMonthlyExpense(formatCurrency(finance.monthlyExpense));

          // Calculate disposable income
          const disposable = finance.monthlyIncome - finance.monthlyExpense;

          setDisposableIncome(formatCurrency(Math.max(0, disposable)));

          // Set selected plan
          setSelectedPlan(finance.selectedPlan);
        }
      }

      // Fetch debt data
      const debtsResponse = await fetch("/api/debts");

      if (debtsResponse.ok) {
        const { debts } = await debtsResponse.json();

        setDebts(debts || []);

        // Calculate debt summary
        if (debts && debts.length > 0) {
          // Calculate total amount
          const totalAmount = debts.reduce(
            (sum: number, debt: any) => sum + debt.remainingAmount,
            0,
          );

          // Calculate monthly payment
          const monthlyPayment = debts.reduce(
            (sum: number, debt: any) => sum + (debt.minimumPayment || 0),
            0,
          );

          // Calculate weighted average interest rate
          const totalInterest = debts.reduce(
            (sum: number, debt: any) =>
              sum + debt.interestRate * debt.remainingAmount,
            0,
          );
          const avgInterestRate = totalInterest / totalAmount;

          setDebtSummary({
            totalDebts: debts.length,
            totalAmount: formatCurrency(totalAmount),
            monthlyPayment: formatCurrency(monthlyPayment),
            interestRate: `${avgInterestRate.toFixed(1)}%`,
          });
        }
      }

      // Calculate risk percentage based on debt-to-income ratio
      calculateDebtRiskPercentage();
      setIsLoaded(true);
    } catch (error) {
      showNotification(
        "ข้อผิดพลาด",
        "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        "solid",
        "danger",
      );
      setIsLoaded(true);
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-6 bg-blue-500 px-4 py-6 text-white">
        <div className="mb-2 flex items-center">
          <BackButton className="text-white" href="/" />
          <h1 className="ml-2 text-xl font-bold">Debt Overview</h1>
          {!isAuthenticated && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              โหมดผู้เยี่ยมชม
            </span>
          )}
        </div>
        <p className="text-sm">ทำความเข้าใจหนี้ของคุณนะ</p>
      </div>

      {/* Summary Section */}
      <div className="mb-6 px-4">
        <SummarySection
          interestRate={debtSummary.interestRate}
          monthlyPayment={debtSummary.monthlyPayment}
          totalAmount={debtSummary.totalAmount}
          totalDebts={debtSummary.totalDebts}
        />
      </div>

      {/* Risk Meter */}
      <div className="mb-6 px-4">
        <RiskMeter
          riskPercentage={debtRiskPercentage}
          onPlanClick={() => {
            setIsIncomeExpenseDrawerOpen(true);
          }}
        />
      </div>

      {/* Plan selected section */}
      <div className="mb-6 px-4">
        <PlanSection
          selectedPlan={selectedPlan}
          onPlanChange={async (plan) => {
            setSelectedPlan(plan);

            // Save to database if authenticated
            if (isAuthenticated) {
              try {
                const response = await fetch("/api/finance", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ selectedPlan: plan }),
                });

                if (!response.ok) {
                }
              } catch (error) {}
            }
          }}
        />
      </div>

      {/* Income/Expense Section */}
      <div className="mb-6 px-4">
        <IncomeExpenseSection
          disposableIncome={disposableIncome}
          monthlyExpense={monthlyExpense}
          monthlyIncome={monthlyIncome}
          setIsIncomeExpenseDrawerOpen={setIsIncomeExpenseDrawerOpen}
        />
      </div>

      {/* All Debt Section */}
      <div className="mb-6 px-4">
        <AllDebtSection
          debts={debts}
          onAddDebt={() => setIsDebtFormOpen(true)}
        />
      </div>

      {/* Income Expense Modal */}
      <IncomeExpenseModal
        initialData={{
          monthlyIncome: monthlyIncome,
          monthlyExpense: monthlyExpense,
        }}
        isOpen={isIncomeExpenseDrawerOpen}
        onClose={() => setIsIncomeExpenseDrawerOpen(false)}
        onSave={async ({
          monthlyIncome,
          monthlyExpense,
          incomeAttachments,
          expenseAttachments,
        }) => {
          // Update local state
          setMonthlyIncome(monthlyIncome);
          setMonthlyExpense(monthlyExpense);

          // Calculate disposable income
          const income = parseFloat(monthlyIncome);
          const expense = parseFloat(monthlyExpense);
          const disposable = Math.max(0, income - expense);

          setDisposableIncome(formatCurrency(disposable));

          // Update risk calculation
          calculateDebtRiskPercentage();

          // If user is authenticated, save to database
          if (isAuthenticated) {
            try {
              const response = await fetch("/api/finance", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  monthlyIncome: income,
                  monthlyExpense: expense,
                  incomeAttachments: incomeAttachments || [],
                  expenseAttachments: expenseAttachments || [],
                }),
              });

              if (!response.ok) {
                showNotification(
                  "ข้อผิดพลาด",
                  "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
                  "solid",
                  "danger",
                );
              }
            } catch (error) {
              showNotification(
                "ข้อผิดพลาด",
                "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
                "solid",
                "danger",
              );
            }
          }
        }}
      />

      {/* Debt Form Drawer */}
      <DebtFormModal
        isOpen={isDebtFormOpen}
        onClose={() => setIsDebtFormOpen(false)}
        onSave={async (debtData) => {
          try {
            // If authenticated, save to database
            if (isAuthenticated) {
              const response = await fetch("/api/debts", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: debtData.debtName,
                  debtType: debtData.paymentType,
                  totalAmount: parseFloat(debtData.totalAmount),
                  remainingAmount: parseFloat(debtData.totalAmount),
                  interestRate: parseFloat(debtData.interestRate),
                  paymentDueDay: parseInt(
                    debtData.dueDate.replace("ทุกวันที่ ", ""),
                  ),
                  minimumPayment: parseFloat(debtData.minimumPayment),
                  attachments: debtData.attachments || [],
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to save debt");
              }

              // Refresh all debt data after saving
              loadUserData();
            } else {
              // Add to local state for guest mode
              setDebts([
                ...debts,
                {
                  _id: Date.now().toString(),
                  name: debtData.debtName,
                  debtType: debtData.paymentType,
                  totalAmount: parseFloat(debtData.totalAmount),
                  remainingAmount: parseFloat(debtData.totalAmount),
                  interestRate: parseFloat(debtData.interestRate),
                  minimumPayment: parseFloat(debtData.minimumPayment),
                  paymentDueDay: parseInt(
                    debtData.dueDate.replace("ทุกวันที่ ", ""),
                  ),
                },
              ]);

              // Update debt risk calculation
              calculateDebtRiskPercentage();
            }

            // Show success notification
            showNotification(
              "เพิ่มรายการหนี้สำเร็จ",
              "รายการหนี้ถูกบันทึกเรียบร้อยแล้ว",
              "solid",
              "success",
            );
          } catch (error) {
            showNotification(
              "ข้อผิดพลาด",
              "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
              "solid",
              "danger",
            );
          } finally {
            // Close the drawer
            setIsDebtFormOpen(false);
          }
        }}
      />
    </div>
  );
}
