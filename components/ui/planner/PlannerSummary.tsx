import React, { useState, useEffect } from "react";
import { CalendarIcon, LineChartIcon } from "lucide-react";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { useSession } from "next-auth/react";

import DebtPlanModal from "../debt_plan/DebtPlanModal";
import { DebtPlan } from "../debt_plan/types";

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

type PlannerSummaryProps = {
  totalDebt?: number;
  paidDebt?: number;
  remainingDebt?: number;
  paymentPercentage?: number;
  goalType?: string;
  paymentStrategy?: string;
  monthlyPayment?: number;
  timeInMonths?: number;
  totalInterest?: number;
  completionDate?: string;
};

export default function PlannerSummary(props: PlannerSummaryProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [totalDebt, setTotalDebt] = useState(0);
  const [remainingDebt, setRemainingDebt] = useState(0);
  const [paidDebt, setPaidDebt] = useState(0);
  const [paymentPercentage, setPaymentPercentage] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [isAdjustPlanModalOpen, setIsAdjustPlanModalOpen] = useState(false);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [activePlanId, setActivePlanId] = useState<string>("");
  const [riskPercentage, setRiskPercentage] = useState(60); // Default risk percentage

  // Available goal types from the model
  const GOAL_TYPES = [
    "เห็นผลเร็ว", // Quick results
    "สมดุล", // Balanced
    "ประหยัดดอกเบี้ย", // Save interest
    "คุ้มดอกเบี้ย", // Interest efficient
    "คุ้มที่สุด", // Most efficient
  ];

  // Available payment strategies
  const PAYMENT_STRATEGIES = [
    "Snowball", // Focus on smallest debts first
    "Avalanche", // Focus on highest interest first
    "Proportional", // Pay proportionally across all debts
  ];

  // Plan data state
  const [planData, setPlanData] = useState({
    goalType: props.goalType || "เห็นผลเร็ว",
    paymentStrategy: props.paymentStrategy || "Snowball",
    timeInMonths: props.timeInMonths || 30,
    totalInterest: props.totalInterest || 24500,
  });

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Calculate estimated completion date
  const calculateCompletionDate = (monthsFromNow: number) => {
    const date = new Date();

    date.setMonth(date.getMonth() + monthsFromNow);
    const month = date.toLocaleString("th-TH", { month: "short" });
    const year = date.getFullYear() + 543; // Convert to Buddhist Era

    return `${month} ${year}`;
  };

  // Handle plan updates from the modal
  const handlePlanUpdate = (plan: DebtPlan) => {
    // Make sure to handle potentially undefined values safely
    const goalType = plan.goalType || "เห็นผลเร็ว";
    const paymentStrategy = plan.paymentStrategy || "Snowball";
    const timeInMonths = plan.timeInMonths || 30;
    const monthlyPayment = plan.monthlyPayment || 0;

    setPlanData({
      ...planData,
      goalType: goalType,
      paymentStrategy: paymentStrategy,
      timeInMonths: timeInMonths,
      // Calculate new interest based on the plan (simplified)
      totalInterest: Math.round(remainingDebt * 0.05 * (timeInMonths / 12)),
    });

    setMonthlyPayment(monthlyPayment);

    // Save the updated plan to the backend
    saveDebtPlanToDatabase(plan);
  };

  // Function to save debt plan to database
  const saveDebtPlanToDatabase = async (plan: DebtPlan) => {
    try {
      // Prepare plan data for API
      const planData = {
        ...plan,
        userId: session?.user?.id || localStorage.getItem("anonymousId"),
        anonymousId: !session?.user?.id
          ? localStorage.getItem("anonymousId")
          : undefined,
        isActive: true,
        debtItems: debts.map((debt) => debt._id), // Include the debt items from real data
        _id: activePlanId || undefined,
      };

      // Save to database
      const response = await fetch("/api/debt-plans", {
        method: activePlanId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        const result = await response.json();

        if (result._id) {
          setActivePlanId(result._id);
        }
      }
    } catch (error) {
      console.error("Error saving debt plan:", error);
    }
  };

  // Load debt data and active debt plan
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch debts - real data for debt context
        const debtsResponse = await fetch("/api/debts");

        // Fetch active debt plan
        const plansUrl = session?.user?.id
          ? `/api/debt-plans?isActive=true`
          : `/api/debt-plans?anonymousId=${localStorage.getItem("anonymousId")}&isActive=true`;

        const plansResponse = await fetch(plansUrl);

        if (debtsResponse.ok) {
          const { debts } = await debtsResponse.json();

          // Calculate totals from real debt data
          const total = debts.reduce(
            (sum: number, debt: DebtItem) => sum + debt.totalAmount,
            0,
          );
          const remaining = debts.reduce(
            (sum: number, debt: DebtItem) => sum + debt.remainingAmount,
            0,
          );
          const paid = total - remaining;
          const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;

          // Calculate monthly payment (sum of all minimum payments)
          const monthly = debts.reduce((sum: number, debt: DebtItem) => {
            // Default to 5% of remaining if no minimum payment is set
            const minPayment =
              debt.minimumPayment || Math.ceil(debt.remainingAmount * 0.05);

            return sum + minPayment;
          }, 0);

          setTotalDebt(total);
          setRemainingDebt(remaining);
          setPaidDebt(paid);
          setPaymentPercentage(percentage);
          setMonthlyPayment(monthly);
          setDebts(debts);

          // Calculate a reasonable risk percentage based on debt-to-income ratio
          // Here we're using a placeholder calculation - in a real app this would use the user's income data
          const estimatedRiskPercentage = Math.min(
            Math.round((remaining / (monthly * 10)) * 100),
            80,
          );

          setRiskPercentage(estimatedRiskPercentage);
        }

        // Process active plan if available
        if (plansResponse.ok) {
          const plans = await plansResponse.json();

          if (plans && plans.length > 0) {
            // Get the most recent active plan
            const activePlan = plans[0];

            setActivePlanId(activePlan._id);

            // Update plan data with actual user selections
            setPlanData({
              goalType: activePlan.goalType || planData.goalType,
              paymentStrategy:
                activePlan.paymentStrategy || planData.paymentStrategy,
              timeInMonths: activePlan.timeInMonths || planData.timeInMonths,
              totalInterest: planData.totalInterest, // Calculate this based on the plan
            });

            // Update monthly payment if available
            if (activePlan.monthlyPayment) {
              setMonthlyPayment(activePlan.monthlyPayment);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl p-4 bg-[#3776C1] text-white shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-blue-300 rounded mb-3" />
            <div className="h-10 bg-white rounded mb-3" />
            <div className="h-6 bg-blue-300 rounded" />
          </div>
        </div>
        <div className="rounded-xl p-4 bg-white shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-3" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debt Overview Card */}
      <div className="rounded-xl p-4 bg-[#3776C1] text-white shadow-sm">
        <h2 className="text-center text-lg font-medium mb-3">
          ยอดหนี้คงเหลือทั้งหมดของคุณ
        </h2>
        <div className="bg-white text-[#3776C1] rounded-lg py-2 px-4 text-center mb-3">
          <span className="text-3xl font-bold">
            {formatNumber(remainingDebt)} บาท
          </span>
        </div>
        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden mb-1">
          {/* Calculate width based on paid debt percentage */}
          <div
            className="absolute top-0 left-0 h-full bg-yellow-400"
            style={{
              width: `${totalDebt > 0 ? Math.min(100, Math.round((paidDebt / totalDebt) * 100)) : 0}%`,
            }}
          />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-800">
              {totalDebt > 0
                ? Math.min(100, Math.round((paidDebt / totalDebt) * 100))
                : 0}
              %
            </span>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-yellow-400 rounded-full mr-2" />
            <span>ชำระแล้ว</span>
            <span className="ml-2 font-medium">{formatNumber(paidDebt)}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">ยอดรวม:</span>
            <span className="font-medium">{formatNumber(totalDebt)}</span>
          </div>
        </div>
      </div>

      {/* Plan Summary Card */}
      <div className="rounded-xl p-4 bg-[#3776C1] text-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">สรุปภาพรวมแผนของคุณ</h2>
          <button
            aria-label="ปรับแผนการชำระหนี้"
            className="bg-yellow-400 text-[#3776C1] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
            onClick={() => setIsAdjustPlanModalOpen(true)}
          >
            ปรับแผน
            <HiAdjustmentsHorizontal className="" />
          </button>
        </div>

        <div className="bg-white text-[#3776C1] rounded-lg p-4 mb-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">เป้าหมายที่เลือก :</span>
              <span className="font-medium">
                {GOAL_TYPES.includes(planData.goalType)
                  ? planData.goalType
                  : "เห็นผลเร็ว"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">รูปแบบแผนการชำระหนี้ :</span>
              <span className="font-medium">
                {planData.paymentStrategy === "Snowball" &&
                  "ชำระหนี้ก้อนเล็กก่อน"}
                {planData.paymentStrategy === "Avalanche" &&
                  "ชำระหนี้ดอกเบี้ยสูงก่อน"}
                {planData.paymentStrategy === "Proportional" &&
                  "ชำระตามสัดส่วน"}
                {!PAYMENT_STRATEGIES.includes(planData.paymentStrategy) &&
                  "ชำระหนี้ก้อนเล็กก่อน"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">เงินต่อเดือนที่ต้องใช้ :</span>
              <span className="font-medium">
                {formatNumber(monthlyPayment)} บาท
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">เวลาที่ใช้ :</span>
              <span className="font-medium">{planData.timeInMonths} เดือน</span>
            </div>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="space-y-2">
          <button className="w-full bg-white text-[#3776C1] rounded-lg py-2 px-4 flex items-center justify-center text-sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>
              หากชำระหนี้ตามแผนคุณจะปลดหนี้ได้ภายใน{" "}
              {monthlyPayment > 0
                ? calculateCompletionDate(
                    Math.ceil(remainingDebt / monthlyPayment),
                  )
                : calculateCompletionDate(planData.timeInMonths)}
            </span>
          </button>
          <button className="w-full bg-white text-[#3776C1] rounded-lg py-2 px-4 flex items-center justify-center text-sm">
            <LineChartIcon className="h-4 w-4 mr-2" />
            <span>
              ดอกเบี้ยรวมที่ต้องจ่าย {formatNumber(planData.totalInterest)} บาท
            </span>
          </button>
        </div>
      </div>

      {/* Adjust Plan Modal */}
      <DebtPlanModal
        goalType={planData.goalType}
        monthlyPayment={monthlyPayment}
        paymentStrategy={planData.paymentStrategy}
        riskPercentage={riskPercentage}
        timeInMonths={planData.timeInMonths}
        onOpenChange={setIsAdjustPlanModalOpen}
        onSavePlan={handlePlanUpdate}
        debtContext={debts} /* Pass real debt data as context */
        isOpen={isAdjustPlanModalOpen}
      />
    </div>
  );
}
