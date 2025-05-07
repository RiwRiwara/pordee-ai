import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Spinner } from "@heroui/spinner";
import { FiCheckCircle, FiCalendar } from "react-icons/fi";

interface CompletedPayment {
  id: string;
  debtName: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
}

export default function CompleteMonth() {
  const { data: session } = useSession();
  const [completedPayments, setCompletedPayments] = useState<
    CompletedPayment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0); // Used to trigger re-fetching

  // Format with commas for display
  const formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Format date to Thai format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Load completed payments data
  useEffect(() => {
    const fetchCompletedPayments = async () => {
      if (!session) {
        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch payments from the API
        const response = await fetch("/api/payments");

        if (!response.ok) {
          throw new Error(`Error fetching payments: ${response.status}`);
        }

        const { payments } = await response.json();

        // Filter payments for the current month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const currentMonthPayments = payments.filter((payment: any) => {
          const paymentDate = new Date(payment.paymentDate);

          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        });

        // We need to get debt names for each payment
        const debtsResponse = await fetch("/api/debts");
        let debtsMap: Record<string, string> = {};

        if (debtsResponse.ok) {
          const { debts } = await debtsResponse.json();

          // Create a map of debt ID to debt name
          debtsMap = debts.reduce((map: any, debt: any) => {
            map[debt._id] = debt.name;

            return map;
          }, {});
        }

        // Format payments for display
        const formattedPayments = currentMonthPayments.map((payment: any) => ({
          id: payment._id,
          debtName: debtsMap[payment.debtId] || "Unknown Debt",
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentType: payment.paymentType,
        }));

        // Sort by payment date (newest first)
        formattedPayments.sort(
          (a: CompletedPayment, b: CompletedPayment) =>
            new Date(b.paymentDate).getTime() -
            new Date(a.paymentDate).getTime(),
        );

        // Calculate total completed amount
        const total = formattedPayments.reduce(
          (sum: number, payment: CompletedPayment) => sum + payment.amount,
          0,
        );

        setCompletedPayments(formattedPayments);
        setTotalCompleted(total);
      } catch (error) {
        console.error("Error fetching completed payments:", error);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        setCompletedPayments([]);
        setTotalCompleted(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedPayments();
  }, [session, refreshTrigger]); // Re-fetch when session changes or refreshTrigger is updated

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center py-12">
          <Spinner color="primary" size="lg" />
          <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium"
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-700">
            กรุณาเข้าสู่ระบบเพื่อดูข้อมูลหนี้ของคุณ
          </p>
        </div>
      </div>
    );
  }

  // Calculate the current month and year for display
  const currentDate = new Date();
  const thaiMonthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const currentMonth = thaiMonthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear() + 543; // Convert to Buddhist Era

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-1 text-[#3776C1]">
        เสร็จสิ้นแล้วในเดือนนี้
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        {currentMonth} {currentYear}
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-500">ยอดรวมที่ชำระแล้ว</span>
            <p className="text-2xl font-bold text-[#3776C1]">
              {formatNumber(totalCompleted)} บาท
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <FiCheckCircle className="text-green-600 text-2xl" />
          </div>
        </div>
      </div>

      {completedPayments.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-2">
            <FiCalendar className="text-blue-500 text-2xl" />
          </div>
          <p className="text-blue-700">ไม่พบรายการที่ชำระแล้วในเดือนนี้</p>
          <p className="text-sm text-blue-600 mt-1">
            คุณยังไม่ได้ชำระหนี้ใดๆ ในเดือนนี้
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">ชำระหนี้{payment.debtName}</h3>
                  <p className="text-sm text-gray-500">
                    วันที่ชำระ: {formatDate(payment.paymentDate)}
                  </p>
                  <div className="mt-1 flex gap-1">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {payment.paymentType === "minimum"
                        ? "ยอดขั้นต่ำ"
                        : payment.paymentType === "extra"
                          ? "ยอดพิเศษ"
                          : "ยอดปกติ"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#3776C1]">
                    {formatNumber(payment.amount)} บาท
                  </p>
                  <div className="flex items-center justify-end mt-1 text-green-600">
                    <FiCheckCircle className="mr-1" />
                    <span className="text-xs">เสร็จสิ้น</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
