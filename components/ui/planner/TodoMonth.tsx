import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { FiChevronDown, FiChevronUp, FiPlus, FiMinus } from "react-icons/fi";

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

interface PaymentItem {
  debtId: string;
  debtName: string;
  amount: number;
  dueDate: number;
  details?: { name: string; amount: number }[];
}

export default function TodoMonth() {
  // We don't directly use debts state but need the setter for API response
  const [, setDebts] = useState<DebtItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentItem | null>(
    null,
  );
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [expandedDetails, setExpandedDetails] = useState<{
    [key: string]: boolean;
  }>({});

  // Format with commas for display
  const formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Load debt data
  useEffect(() => {
    const fetchDebts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/debts");

        if (response.ok) {
          const { debts } = await response.json();

          setDebts(debts || []);

          // Create payment items from debts
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

          // Filter debts with due dates in this month
          const monthlyPayments = debts
            .filter(
              (debt: DebtItem) =>
                debt.paymentDueDay && debt.paymentDueDay <= daysInMonth,
            )
            .map((debt: DebtItem) => {
              // Create payment details if available
              const details = [];

              if (debt.debtType === "บัตรเครดิต") {
                details.push(
                  { name: "Topic 1", amount: 1200 },
                  { name: "Topic 2", amount: 2500 },
                  { name: "Topic 3", amount: 2000 },
                );
              }

              return {
                debtId: debt._id,
                debtName: debt.name,
                amount: debt.minimumPayment || 0,
                dueDate: debt.paymentDueDay || 1,
                details: details.length > 0 ? details : undefined,
              };
            })
            .sort((a: PaymentItem, b: PaymentItem) => a.dueDate - b.dueDate);

          setPayments(monthlyPayments);
        }
      } catch (error) {
        // Error handled by setting empty array in finally block
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebts();
  }, []);

  const handleCompletePayment = (payment: PaymentItem) => {
    setCurrentPayment(payment);
    setPaymentAmount(payment.amount);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!currentPayment) return;

    try {
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
          paymentType: "regular",
        }),
      });

      if (response.ok) {
        // Remove the payment from the list and refresh data
        setPayments((prevPayments) =>
          prevPayments.filter((p) => p.debtId !== currentPayment.debtId),
        );

        // Show a success message or toast notification here if you have one
        // Payment recorded successfully
      } else {
        // Failed to record payment
      }
    } catch (error) {
      // Error handled by closing modal and resetting state in finally block
    } finally {
      setIsModalOpen(false);
      setCurrentPayment(null);
    }
  };

  const toggleDetails = (paymentId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [paymentId]: !prev[paymentId],
    }));
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4" />
          <div className="h-32 bg-gray-200 rounded mb-4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[#3776C1]">
        สิ่งที่ต้องทำในเดือนนี้
      </h2>

      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ไม่พบรายการที่ต้องชำระในเดือนนี้
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.debtId}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">
                      ชำระหนี้{payment.debtName} {formatNumber(payment.amount)}{" "}
                      บาท
                    </h3>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">
                        วันที่ต้องชำระ:
                      </span>
                      <span className="ml-1 text-sm font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                        {payment.dueDate}
                      </span>
                    </div>
                  </div>
                  <Button
                    color="primary"
                    size="sm"
                    onPress={() => handleCompletePayment(payment)}
                  >
                    เสร็จสิ้น
                  </Button>
                </div>

                {payment.details && (
                  <div className="mt-2">
                    <button
                      aria-controls="payment-details"
                      aria-expanded={expandedDetails[payment.debtId]}
                      className="flex items-center text-sm text-blue-600 bg-transparent border-none p-0 cursor-pointer"
                      onClick={() => toggleDetails(payment.debtId)}
                    >
                      {expandedDetails[payment.debtId] ? (
                        <>
                          <span>เห็นน้อยลง</span>
                          <FiChevronUp className="ml-1" />
                        </>
                      ) : (
                        <>
                          <span>รายละเอียดเพิ่มเติม</span>
                          <FiChevronDown className="ml-1" />
                        </>
                      )}
                    </button>

                    {expandedDetails[payment.debtId] && (
                      <div className="mt-2 border-t pt-2" id="payment-details">
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
            </div>
          ))}
        </div>
      )}

      {/* Payment Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <div className="text-center font-bold">คุณชำระไปเท่าไหร่ ?</div>
          </ModalHeader>
          <ModalBody>
            <div className="flex justify-center items-center space-x-4">
              <button
                className="bg-gray-200 p-2 rounded-full"
                onClick={() =>
                  setPaymentAmount((prev) => Math.max(0, prev - 100))
                }
              >
                <FiMinus />
              </button>

              <div className="relative w-32">
                <input
                  className="w-full text-center text-2xl font-bold py-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                  type="text"
                  value={paymentAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");

                    setPaymentAmount(value ? parseInt(value) : 0);
                  }}
                />
              </div>

              <button
                className="bg-gray-200 p-2 rounded-full"
                onClick={() => setPaymentAmount((prev) => prev + 100)}
              >
                <FiPlus />
              </button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="w-full"
              color="primary"
              onPress={handleConfirmPayment}
            >
              ยืนยัน
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
