"use client";
import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card } from "@heroui/card";

import { useAuth } from "@/context/AuthContext";
import BackButton from "@/components/ui/BackButton";
import PlannerSummary from "@/components/ui/planner/PlannerSummary";
import MyDebt from "@/components/ui/planner/MyDebt";
import TipSection from "@/components/ui/planner/TipSection";
import Calendar from "@/components/ui/planner/Calendar";
import NewEarly from "@/components/ui/planner/NewEarly";
import FloatingMessageButton from "@/components/ui/FloatingMessageButton";
import ChatDialog from "@/components/ui/ChatDialog";
import RemaingMonth from "@/components/ui/planner/RemaingMonth";
import TodoMonth from "@/components/ui/planner/TodoMonth";
import CompleteMonth from "@/components/ui/planner/CompleteMonth";
import { DebtContext } from "@/lib/aiService";
// Interface for debt items
interface DebtItem {
  _id: string;
  name: string;
  debtType: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  paymentDueDay?: number;
}

export default function Planning() {
  const { isAuthenticated } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [dtiPercentage, setDtiPercentage] = useState<number>(0);
  const [debtContext, setDebtContext] = useState<DebtContext | undefined>();

  // Fetch debt data and user financial profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch debts
        const debtsResponse = await fetch("/api/debts");

        if (debtsResponse.ok) {
          const { debts: debtsData } = await debtsResponse.json();

          setDebts(debtsData || []);

          // Fetch user financial profile to get income
          const profileResponse = await fetch("/api/financial-profile");

          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            const monthlyIncome = profile?.monthlyIncome || 0;

            setIncome(monthlyIncome);

            // Calculate DTI (Debt-to-Income ratio) based on the formula from memory
            // Formula: (all minimum debt / all income before expense and tax) * 100
            if (monthlyIncome > 0) {
              const totalMinimumDebt = debtsData.reduce(
                (sum: number, debt: DebtItem) =>
                  sum + (debt.minimumPayment || 0),
                0,
              );

              const dtiRatio = (totalMinimumDebt / monthlyIncome) * 100;

              setDtiPercentage(Math.round(dtiRatio));

              // Create debt context for AI service
              const aiContext: DebtContext = {
                debtItems: debtsData.map((debt: DebtItem) => ({
                  id: debt._id,
                  name: debt.name,
                  debtType: debt.debtType,
                  totalAmount: debt.totalAmount.toString(),
                  minimumPayment: (debt.minimumPayment || 0).toString(),
                  interestRate: debt.interestRate.toString(),
                  dueDate: (debt.paymentDueDay || 1).toString(),
                  paymentStatus: "pending",
                })),
                income: monthlyIncome.toString(),
                expense: "0", // Default value if not available
                riskPercentage: dtiRatio,
              };

              setDebtContext(aiContext);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="pb-20 bg-white relative">
      {/* Header */}
      <div className="mb-6 bg-[#3776C1] px-4 py-6 text-white">
        <div className="mb-2 flex items-center">
          <BackButton className="text-white" href="/home" />
          <h1 className="ml-2 text-xl font-bold">Pordee Planner</h1>
          {!isAuthenticated && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              โหมดผู้เยี่ยมชม
            </span>
          )}
        </div>
        <p className="text-sm">
          Smart Assistant – ผู้ช่วยวางแผนปลดหนี้ ที่ออกแบบมาเพื่อคุณ
        </p>
      </div>

      {/* tab */}
      <div className="w-full">
        <Tabs aria-label="Options" fullWidth={true}>
          <Tab key="summary" className="flex flex-col gap-4" title="ภาพรวม">
            <Card>
              <PlannerSummary />
            </Card>
            <Card>
              <MyDebt />
            </Card>
            <Card>
              <TipSection
                debtContext={debtContext}
                riskPercentage={dtiPercentage}
              />
            </Card>
            <Card>
              <Calendar />
            </Card>
            <Card>
              <NewEarly />
            </Card>
          </Tab>
          <Tab
            key="this_month"
            className="flex flex-col gap-4"
            title="เดือนนี้"
          >
            <Card>
              <RemaingMonth />
            </Card>
            <Card>
              <TodoMonth />
            </Card>
            <Card>
              <CompleteMonth />
            </Card>
          </Tab>
        </Tabs>
      </div>

      {/* Floating Message Button */}
      <FloatingMessageButton onClick={() => setIsChatOpen(true)} />

      {/* Chat Dialog */}
      <ChatDialog isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
