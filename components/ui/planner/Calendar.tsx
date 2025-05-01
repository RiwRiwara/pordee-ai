import React, { useState, useEffect } from "react";

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

export default function Calendar() {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load debt data
  useEffect(() => {
    const fetchDebts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/debts");
        
        if (response.ok) {
          const { debts } = await response.json();
          setDebts(debts || []);
        }
      } catch (error) {
        console.error("Error fetching debts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebts();
  }, []);

  // Calendar functions
  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get Thai day abbreviations
  const thaiDays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);

    // Create days array
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return { days, firstDay };
  };

  const { days, firstDay } = generateCalendarDays();

  // Get debts for a specific day
  const getDebtsForDay = (day: number) => {
    return debts.filter(debt => debt.paymentDueDay === day);
  };

  // Format month name in Thai
  const getThaiMonth = (date: Date) => {
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return thaiMonths[date.getMonth()];
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">ปฏิทินการชำระ</h2>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-center text-[#3776C1]">ปฏิทินการชำระ</h2>
      <div className="border-b-2 border-[#3776C1] w-40 mx-auto mb-4"></div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {thaiDays.map((day, index) => (
          <div key={index} className="text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first day of month */}
        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="h-12"></div>
        ))}
        
        {/* Calendar days */}
        {days.map((day) => {
          const dayDebts = getDebtsForDay(day);
          const hasDebts = dayDebts.length > 0;
          
          return (
            <div key={day} className="relative h-16 flex flex-col items-center">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-1 ${hasDebts ? 'bg-[#3776C1] text-white' : 'text-[#3776C1]'}`}>
                {day}
              </div>
              
              {/* Debt indicators */}
              {dayDebts.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1">
                  {dayDebts.slice(0, 2).map((debt) => (
                    <div 
                      key={debt._id}
                      className={`text-xs px-2 py-1 rounded-full ${debt.debtType === "บัตรเครดิต" ? 'bg-yellow-300' : 'bg-blue-300'}`}
                      style={{ fontSize: '0.6rem' }}
                    >
                      {debt.name.length > 6 ? `${debt.name.substring(0, 6)}...` : debt.name}
                    </div>
                  ))}
                  {dayDebts.length > 2 && (
                    <div className="text-xs bg-gray-200 px-1 rounded-full" style={{ fontSize: '0.6rem' }}>
                      +{dayDebts.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
