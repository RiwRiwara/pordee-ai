"use client";
import BackButton from "@/components/ui/BackButton";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import PlannerSummary from "@/components/ui/planner/PlannerSummary";
export default function Planning() {
  const { isAuthenticated } = useAuth();

  return <div className="pb-20">
    {/* Header */}
    <div className="mb-6 bg-[#3776C1] px-4 py-6 text-white">
      <div className="mb-2 flex items-center">
        <BackButton className="text-white" href="/" />
        <h1 className="ml-2 text-xl font-bold">Pordee Planner</h1>
        {!isAuthenticated && (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            โหมดผู้เยี่ยมชม
          </span>
        )}
      </div>
      <p className="text-sm">Smart Assistant – ผู้ช่วยวางแผนปลดหนี้ ที่ออกแบบมาเพื่อคุณ</p>
    </div>

    {/* tab */}
    <div className="w-full">
      <Tabs aria-label="Options" fullWidth={true}>
        <Tab key="summary" title="ภาพรวม">
          <Card>
            <PlannerSummary />
          </Card>
        </Tab>
        <Tab key="this_month" title="เดือนนี้">
          <Card>
            <CardBody>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur.
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>

  </div>;
}
