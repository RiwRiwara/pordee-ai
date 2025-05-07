import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiMinus,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";

interface DebtItem {
  _id: string;
  name: string;
  debtType: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  paymentDueDay?: number;
  originalPaymentType?: string;
}

interface PaymentItem {
  id: string; // Unique identifier for the payment item in the UI
  debtId: string;
  debtName: string;
  amount: number;
  dueDate: number;
  details?: { name: string; amount: number }[];
  status?: "pending" | "completed";
  daysUntilDue?: number;
  isPastDue?: boolean;
}

export default function TodoMonth() {
  const { data: session } = useSession();
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentItem | null>(
    null,
  );
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [expandedDetails, setExpandedDetails] = useState<{
    [key: string]: boolean;
  }>({});
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0); // Used to trigger re-fetching

  // Format with commas for display
  const formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Load debt data and payment history
  useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch debts
        const debtsResponse = await fetch("/api/debts");

        if (!debtsResponse.ok) {
          throw new Error(`Error fetching debts: ${debtsResponse.status}`);
        }

        const { debts } = await debtsResponse.json();
        const validDebts = (debts || []).filter(
          (debt: any) =>
            debt &&
            typeof debt.minimumPayment === "number" &&
            typeof debt.paymentDueDay === "number",
        );

        setDebts(validDebts);

        // Fetch completed payments for this month to exclude them
        const paymentsResponse = await fetch("/api/payments");
        let completedPayments: any[] = [];

        if (paymentsResponse.ok) {
          const { payments } = await paymentsResponse.json();

          // Filter payments for the current month
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();

          completedPayments = payments.filter((payment: any) => {
            const paymentDate = new Date(payment.paymentDate);

            return (
              paymentDate.getMonth() === currentMonth &&
              paymentDate.getFullYear() === currentYear
            );
          });
        }

        // Get the completed debt IDs for this month
        const completedDebtIds = completedPayments.map(
          (payment: any) => payment.debtId,
        );

        // Create payment items from debts that haven't been paid this month
        const currentDate = new Date();
        const currentDay = currentDate.getDate();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

        // Filter debts with due dates in this month and not yet paid
        const monthlyPayments = validDebts
          .filter(
            (debt: DebtItem) =>
              debt.paymentDueDay &&
              debt.paymentDueDay <= daysInMonth &&
              !completedDebtIds.includes(debt._id),
          )
          .map((debt: DebtItem) => {
            // Calculate days until due or if past due
            const dueDay = debt.paymentDueDay || 1;
            let daysUntilDue = dueDay - currentDay;
            const isPastDue = daysUntilDue < 0;

            if (isPastDue) {
              daysUntilDue = 0; // Just show 0 days if past due
            }

            // Create payment details if available (for credit cards)
            const details = [];

            if (
              debt.debtType === "บัตรเครดิต" ||
              debt.originalPaymentType === "credit_card"
            ) {
              // In a real app, these would be fetched from the API
              // For now, we'll use placeholder data
              const minimumPayment = debt.minimumPayment || 0;

              if (minimumPayment > 0) {
                details.push(
                  { name: "ยอดขั้นต่ำ", amount: minimumPayment },
                  {
                    name: "ยอดแนะนำ",
                    amount: Math.round(minimumPayment * 1.5),
                  },
                );
              }
            }

            return {
              id: `payment-${debt._id}`, // Create a unique ID for UI purposes
              debtId: debt._id,
              debtName: debt.name,
              amount: debt.minimumPayment || 0,
              dueDate: debt.paymentDueDay || 1,
              details: details.length > 0 ? details : undefined,
              status: "pending",
              daysUntilDue,
              isPastDue,
            };
          })
          .sort((a: PaymentItem, b: PaymentItem) => {
            // Sort by past due first, then by due date
            if (a.isPastDue && !b.isPastDue) return -1;
            if (!a.isPastDue && b.isPastDue) return 1;

            return a.dueDate - b.dueDate;
          });

        setPayments(monthlyPayments);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        setDebts([]);
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, refreshTrigger]); // Re-fetch when session changes or refreshTrigger is updated

  // Handle opening the payment modal
  const handleCompletePayment = (payment: PaymentItem) => {
    setCurrentPayment(payment);
    setPaymentAmount(payment.amount);
    setIsModalOpen(true);
  };

  // Handle confirming and recording a payment
  const handleConfirmPayment = async () => {
    if (!currentPayment || !session) return;

    try {
      setIsProcessing(true);

      // Call the payments API to record the payment
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debtId: currentPayment.debtId,
          amount: paymentAmount,
          paymentDate: new Date().toISOString(),
          paymentType:
            paymentAmount === currentPayment.amount ? "minimum" : "regular",
          notes: `Payment for ${currentPayment.debtName}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error recording payment: ${response.status}`);
      }

      // Get the updated debt information
      const debtResponse = await fetch(
        `/api/debts?id=${currentPayment.debtId}`,
      );

      if (debtResponse.ok) {
        // Remove the payment from the list
        setPayments((prevPayments) =>
          prevPayments.filter((p) => p.id !== currentPayment.id),
        );

        // Show success message (in a real app, you might use a toast notification)
        console.log(`Payment of ${paymentAmount} recorded successfully`);
      }

      // Close the modal
      setIsModalOpen(false);
      setCurrentPayment(null);

      // Trigger a refresh of the data
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error recording payment:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกการชำระเงิน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle showing/hiding payment details
  const toggleDetails = (paymentId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [paymentId]: !prev[paymentId],
    }));
  };

  // Format the due date with Thai month
  const formatDueDate = (day: number) => {
    const currentDate = new Date();
    const dueDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );

    return dueDate.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
    });
  };

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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-1 text-[#3776C1]">
        รายการที่ต้องชำระเดือนนี้
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        {currentMonth} {currentYear}
      </p>

      {payments.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-2">
            <FiCalendar className="text-green-500 text-2xl" />
          </div>
          <p className="text-green-700">ไม่พบรายการที่ต้องชำระในเดือนนี้</p>
          <p className="text-sm text-green-600 mt-1">
            คุณได้ชำระหนี้ทั้งหมดสำหรับเดือนนี้แล้ว
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className={`bg-white rounded-xl border ${payment.isPastDue ? "border-red-200" : "border-gray-200"} p-4`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{payment.debtName}</h3>
                  <p className="text-sm text-gray-500">
                    ยอดชำระขั้นต่ำ: {formatNumber(payment.amount)} บาท
                  </p>
                  <div className="mt-1">
                    <span
                      className={`inline-block ${payment.isPastDue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"} text-xs px-2 py-1 rounded-full`}
                    >
                      {payment.isPastDue ? (
                        <>
                          <FiAlertCircle className="inline-block mr-1" />
                          เลยกำหนดชำระ: {formatDueDate(payment.dueDate)}
                        </>
                      ) : (
                        <>ครบกำหนด: {formatDueDate(payment.dueDate)}</>
                      )}
                    </span>
                  </div>
                </div>
                <Button
                  color={payment.isPastDue ? "danger" : "primary"}
                  isLoading={isProcessing && currentPayment?.id === payment.id}
                  size="sm"
                  onPress={() => handleCompletePayment(payment)}
                >
                  ชำระเงิน
                </Button>
              </div>

              {payment.details && (
                <div className="mt-2">
                  <button
                    aria-controls={`payment-details-${payment.id}`}
                    aria-expanded={expandedDetails[payment.id]}
                    className="flex items-center text-sm text-blue-600 bg-transparent border-none p-0 cursor-pointer"
                    onClick={() => toggleDetails(payment.id)}
                  >
                    {expandedDetails[payment.id] ? (
                      <>
                        <span>เห็นน้อยลง</span>
                        <FiChevronUp className="ml-1" />
                      </>
                    ) : (
                      <>
                        <span>ตัวเลือกการชำระ</span>
                        <FiChevronDown className="ml-1" />
                      </>
                    )}
                  </button>

                  {expandedDetails[payment.id] && (
                    <div
                      className="mt-2 border-t pt-2"
                      id={`payment-details-${payment.id}`}
                    >
                      {payment.details.map((detail, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-1"
                        >
                          <span className="text-sm">{detail.name}</span>
                          <span className="text-sm font-medium text-blue-600">
                            {formatNumber(detail.amount)} บาท
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isProcessing && setIsModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>
            <div className="text-center font-bold">
              {currentPayment
                ? `ชำระเงิน ${currentPayment.debtName}`
                : "ชำระเงิน"}
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600 mb-2">ยอดที่ต้องชำระ</p>
              <p className="text-xl font-bold text-blue-600">
                {currentPayment ? formatNumber(currentPayment.amount) : 0} บาท
              </p>
              {currentPayment?.isPastDue && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
                  <FiAlertCircle className="inline-block mr-1" />
                  เลยกำหนดชำระแล้ว กรุณาชำระโดยเร็วที่สุด
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">ระบุจำนวนเงินที่ชำระ</p>
              <div className="flex justify-center items-center space-x-4">
                <button
                  className="bg-gray-200 p-2 rounded-full disabled:opacity-50"
                  disabled={isProcessing || paymentAmount <= 100}
                  onClick={() =>
                    setPaymentAmount((prev) => Math.max(0, prev - 100))
                  }
                >
                  <FiMinus />
                </button>

                <div className="relative w-32">
                  <input
                    className="w-full text-center text-2xl font-bold py-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50"
                    disabled={isProcessing}
                    type="text"
                    value={formatNumber(paymentAmount)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");

                      setPaymentAmount(value ? parseInt(value) : 0);
                    }}
                  />
                  <div className="absolute right-0 bottom-2 text-gray-500">
                    บาท
                  </div>
                </div>

                <button
                  className="bg-gray-200 p-2 rounded-full disabled:opacity-50"
                  disabled={isProcessing}
                  onClick={() => setPaymentAmount((prev) => prev + 100)}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex w-full gap-2">
              <Button
                className="flex-1"
                color="default"
                isDisabled={isProcessing}
                variant="light"
                onPress={() => !isProcessing && setIsModalOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                className="flex-1"
                color="primary"
                isDisabled={paymentAmount <= 0}
                isLoading={isProcessing}
                onPress={handleConfirmPayment}
              >
                ยืนยันการชำระ
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
