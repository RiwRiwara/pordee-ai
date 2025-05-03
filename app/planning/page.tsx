"use client";
import React, { useState } from "react";
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
export default function Planning() {
  const { isAuthenticated } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

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
              <TipSection />
            </Card>
            <Card>
              <Calendar />
            </Card>
            <Card>
              <NewEarly />
            </Card>
          </Tab>
          <Tab key="this_month" title="เดือนนี้">
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
