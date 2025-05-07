import React from "react";

interface DebtItem {
  _id: string;
  name: string;
  debtType: string;
  originalPaymentType?: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment?: number;
  paymentDueDay?: number;
}

interface MyDebtCaroselProps {
  debts: DebtItem[];
  activeFilter?: string;
  formatNumber?: (num: number) => string;
}

export default function MyDebtCarosel({
  debts,
  activeFilter = "ทั้งหมด",
  formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  },
}: MyDebtCaroselProps) {
  // Filter debts based on selected filter
  const filteredDebts = debts.filter((debt) => {
    if (activeFilter === "ทั้งหมด") return true;
    if (activeFilter === "บัตรเครดิต")
      return (
        debt.debtType === "บัตรเครดิต" ||
        debt.originalPaymentType === "credit_card"
      );
    if (activeFilter === "บัตรกดเงินสด")
      return debt.originalPaymentType === "cash_card";
    if (activeFilter === "เงินกู้อนุมัติ")
      return (
        debt.debtType === "สินเชื่อ" || debt.originalPaymentType === "loan"
      );
    if (activeFilter === "สินเชื่อส่วนบุคคล")
      return debt.originalPaymentType === "personal_loan";
    if (activeFilter === "สินเชื่อที่อยู่อาศัย")
      return debt.originalPaymentType === "mortgage";
    if (activeFilter === "สินเชื่อรถยนต์")
      return debt.originalPaymentType === "auto_loan";

    return false;
  });

  return (
    <>
      {/* Debt Cards Carousel */}
      {filteredDebts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ไม่พบรายการหนี้ในหมวดหมู่นี้
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex space-x-4 w-max">
              {filteredDebts.map((debt) => (
                <div
                  key={debt._id}
                  className={`flex-shrink-0 w-64 rounded-xl p-4 ${debt.debtType === "บัตรเครดิต" ? "bg-[#FED174]" : "bg-blue-50"}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-900">{debt.name}</h3>
                    <span className="text-xs bg-white px-2 py-1 rounded-full shadow-sm">
                      {debt.debtType}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">ยอดขั้นต่ำ</p>
                    <p className="text-xl font-medium text-black">
                      {formatNumber(debt.minimumPayment || 0)}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">ยอดแนะนำ</p>
                    <p className="text-xl font-semibold text-[#3C7DD1] bg-white w-fit text-center px-4 rounded-full">
                      {formatNumber(
                        Math.round((debt.minimumPayment || 0) * 1.5),
                      )}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">ยอดคงเหลือ:</span>
                      <span className="font-semibold text-sm">
                        {formatNumber(debt.remainingAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">ดอกเบี้ย:</span>
                      <span className="font-semibold text-sm text-red-500">
                        {debt.interestRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-4">
            {[...Array(Math.min(6, Math.ceil(filteredDebts.length / 2)))].map(
              (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full mx-1 ${i === 0 ? "bg-blue-500" : "bg-gray-300"}`}
                />
              ),
            )}
          </div>
        </div>
      )}
    </>
  );
}
