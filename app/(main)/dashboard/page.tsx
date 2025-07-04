"use client";

import React, { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import BackButton from "@/components/ui/BackButton";
import DebtFormModal from "@/components/ui/debt/DebtFormModal";
import IncomeExpenseModal from "@/components/ui/IncomeExpenseModal";
import RiskMeter from "@/components/ui/RiskMeter";
import { useCustomToast } from "@/components/ui/ToastNotification";
import IncomeExpenseSection from "@/components/ui/IncomeExpenseSection";
import SummarySection from "@/components/ui/SummarySection";
import PlanSection from "@/components/ui/PlanSection";
import AllDebtSectionRefactored from "@/components/ui/debt/AllDebtSectionRefactored";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState("0.00"); // รายได้รวม
  const [monthlyIncome, setMonthlyIncome] = useState("0.00");      // รายได้สุทธิ
  const [monthlyExpense, setMonthlyExpense] = useState("0.00");    // รายจ่ายรวม
  const [disposableIncome, setDisposableIncome] = useState("0.00");  // รายได้สุทธิหลังหักรายจ่าย
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
    // Parse gross income and get total monthly debt payments
    // Use gross income for DTI calculation as per financial standard practice
    const income = parseFloat(grossMonthlyIncome.replace(/,/g, "") || monthlyIncome.replace(/,/g, ""));

    // Calculate total monthly debt payments
    let totalMonthlyDebtPayment = 0;

    debts.forEach((debt) => {
      if (debt.minimumPayment) {
        totalMonthlyDebtPayment += parseFloat(
          debt.minimumPayment.toString().replace(/,/g, ""),
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

  // Map Thai debtType values back to original payment types for UI compatibility
  const getOriginalPaymentType = (debtType: string): string => {
    switch (debtType) {
      case "บัตรเครดิต":
        return "credit_card"; // Default to credit_card for บัตรเครดิต
      case "สินเชื่อ":
        return "installment"; // Default to installment for สินเชื่อ
      case "อื่นๆ":
        return "installment"; // Default others to installment as well
      default:
        return "installment"; // Fallback
    }
  };

  // Create a DebtContext object for the RiskMeter component
  const createDebtContext = () => {
    // Format debt items according to dtiService.DebtContext interface
    const debtItems = debts.map((debt) => ({
      _id: debt._id || String(debt.id) || "",
      name: debt.name || "",
      debtType: debt.debtType || "",
      totalAmount: Number(debt.totalAmount || debt.remainingAmount || 0),
      remainingAmount: Number(debt.remainingAmount || 0),
      interestRate: Number(debt.interestRate || 0),
      minimumPayment: Number(debt.minimumPayment || 0),
      paymentDueDay: debt.paymentDueDay || 1,
    }));

    // Create the debt context object that matches dtiService.DebtContext
    return {
      debtItems,
      // Use grossIncome field for DTI calculation - this matches the formula: 
      // (all minimum debt / all income before expense and tax) * 100
      grossIncome: grossMonthlyIncome.replace(/,/g, ""),
      // Keep income for backward compatibility
      income: monthlyIncome.replace(/,/g, ""),
    };
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
          // Set gross monthly income (add fallback to monthlyIncome for backward compatibility)
          setGrossMonthlyIncome(formatCurrency(finance.grossMonthlyIncome || finance.monthlyIncome || 0));
          
          // Set monthly income
          setMonthlyIncome(formatCurrency(finance.monthlyIncome || 0));
          
          // Set monthly expense
          setMonthlyExpense(formatCurrency(finance.monthlyExpense || 0));
          
          // Calculate disposable income based on net income
          setDisposableIncome(
            formatCurrency(
              (finance.monthlyIncome || 0) - (finance.monthlyExpense || 0),
            ),
          );
          
          setSelectedPlan(finance.selectedPlan);
        }
      }

      // Fetch debt data
      const debtsResponse = await fetch("/api/debts");

      if (debtsResponse.ok) {
        const { debts } = await debtsResponse.json();

        // Process debts to ensure proper formatting for display
        const processedDebts = (debts || []).map((debt: any) => {
          // Ensure debt has all necessary properties
          return {
            ...debt,
            // For UI compatibility, add originalPaymentType based on debtType if needed
            originalPaymentType:
              debt.originalPaymentType || getOriginalPaymentType(debt.debtType),
          };
        });

        setDebts(processedDebts);

        // Calculate debt summary
        if (processedDebts && processedDebts.length > 0) {
          // Calculate total amount
          const totalAmount = processedDebts.reduce(
            (sum: number, debt: any) => sum + debt.remainingAmount,
            0,
          );

          // Calculate monthly payment
          const monthlyPayment = processedDebts.reduce(
            (sum: number, debt: any) => sum + (debt.minimumPayment || 0),
            0,
          );

          // Calculate weighted average interest rate
          const totalInterest = processedDebts.reduce(
            (sum: number, debt: any) =>
              sum + debt.interestRate * debt.remainingAmount,
            0,
          );
          const avgInterestRate = totalInterest / totalAmount;

          setDebtSummary({
            totalDebts: processedDebts.length,
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
      <div className="mb-6 bg-[#3776C1] px-4 py-6 text-white">
        <div className="mb-2 flex items-center">
          <BackButton className="text-white" href="/home" />
          <h1 className="ml-2 text-xl font-bold">Pordee Radar</h1>
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
        <RiskMeter debtContext={createDebtContext()} onPlanClick={() => {}} />
      </div>

      {/* Plan selected section */}
      <div hidden className="mb-6 px-4">
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
        <AllDebtSectionRefactored
          debts={debts}
          totalMonthlyIncome={parseFloat(monthlyIncome.replace(/,/g, ""))}
          onAddDebt={() => setIsDebtFormOpen(true)}
        />
      </div>

      {/* Income Expense Modal */}
      <IncomeExpenseModal
        initialData={{
          grossMonthlyIncome: grossMonthlyIncome, // รายได้รวมก่อนหักค่าใช้จ่าย/ภาษี
          monthlyIncome: monthlyIncome, // รายได้สุทธิ
          monthlyExpense: monthlyExpense, // รายจ่าย
        }}
        isOpen={isIncomeExpenseDrawerOpen}
        onClose={() => setIsIncomeExpenseDrawerOpen(false)}
        onSave={async (data) => {
          try {
            if (isAuthenticated) {
              // Save data to backend if user is authenticated
              const response = await fetch("/api/finance", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  grossMonthlyIncome: parseFloat(
                    data.grossMonthlyIncome?.replace(/,/g, "") || "0",
                  ),
                  monthlyIncome: parseFloat(
                    data.monthlyIncome?.replace(/,/g, "") || "0",
                  ),
                  monthlyExpense: parseFloat(
                    data.monthlyExpense?.replace(/,/g, "") || "0",
                  ),
                  selectedPlan,
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to save finance data");
              }

              // Update local state with formatted values
              setGrossMonthlyIncome(data.grossMonthlyIncome || "0.00");
              setMonthlyIncome(data.monthlyIncome || "0.00");
              setMonthlyExpense(data.monthlyExpense || "0.00");
              setDisposableIncome(
                formatCurrency(
                  parseFloat(data.monthlyIncome?.replace(/,/g, "") || "0") -
                    parseFloat(data.monthlyExpense?.replace(/,/g, "") || "0"),
                ),
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
              // Map paymentType to one of the allowed enum values
              const mapPaymentTypeToDebtType = (paymentType: string) => {
                // Map credit card types to บัตรเครดิต
                if (
                  paymentType === "credit_card" ||
                  paymentType === "cash_card" ||
                  paymentType === "revolving"
                ) {
                  return "บัตรเครดิต";
                }
                // Map loan types to สินเชื่อ
                else if (
                  paymentType === "installment" ||
                  paymentType === "loan" ||
                  paymentType === "mortgage"
                ) {
                  return "สินเชื่อ";
                }

                // Other types
                return "อื่นๆ";
              };

              const mappedDebtType = mapPaymentTypeToDebtType(
                debtData.paymentType,
              );

              const response = await fetch("/api/debts", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: debtData.debtName,
                  debtType: mappedDebtType,
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
              // Use the same mapping function for guest mode
              const mapPaymentTypeToDebtType = (paymentType: string) => {
                if (
                  paymentType === "credit_card" ||
                  paymentType === "cash_card" ||
                  paymentType === "revolving"
                ) {
                  return "บัตรเครดิต";
                } else if (
                  paymentType === "installment" ||
                  paymentType === "loan" ||
                  paymentType === "mortgage"
                ) {
                  return "สินเชื่อ";
                }

                return "อื่นๆ";
              };

              const mappedDebtType = mapPaymentTypeToDebtType(
                debtData.paymentType,
              );

              setDebts([
                ...debts,
                {
                  _id: Date.now().toString(),
                  name: debtData.debtName,
                  debtType: mappedDebtType,
                  originalPaymentType: debtData.paymentType, // Store original for UI purposes
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
