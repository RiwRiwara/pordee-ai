import React, { useState, useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';

interface CompletedPayment {
  id: string;
  debtName: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
}

export default function CompleteMonth() {
  const [completedPayments, setCompletedPayments] = useState<CompletedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCompleted, setTotalCompleted] = useState(0);

  // Format with commas for display
  const formatNumber = (num: number) => {
    return num.toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Format date to Thai format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Load completed payments data
  useEffect(() => {
    const fetchCompletedPayments = async () => {
      try {
        setIsLoading(true);
        
        // Fetch real payments from the API
        const response = await fetch('/api/payments');
        
        if (response.ok) {
          const { payments } = await response.json();
          
          // We need to get debt names for each payment
          const debtsResponse = await fetch('/api/debts');
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
          const formattedPayments = payments.map((payment: any) => ({
            id: payment._id,
            debtName: debtsMap[payment.debtId] || 'Unknown Debt',   
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            paymentType: payment.paymentType
          }));
          
          // Calculate total completed amount
          const total = formattedPayments.reduce((sum: number, payment: CompletedPayment) => sum + payment.amount, 0);
          
          setCompletedPayments(formattedPayments);
          setTotalCompleted(total);
        } else {
          // If API fails, use empty array
          setCompletedPayments([]);
          setTotalCompleted(0);
        }
      } catch (error) {
        console.error('Error fetching completed payments:', error);
        // If error occurs, use empty array
        setCompletedPayments([]);
        setTotalCompleted(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedPayments();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[#3776C1]">เสร็จสิ้นแล้วในเดือนนี้</h2>
      
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-500">ยอดรวมที่ชำระแล้ว</span>
            <p className="text-2xl font-bold text-[#3776C1]">{formatNumber(totalCompleted)} บาท</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <FiCheckCircle className="text-green-600 text-2xl" />
          </div>
        </div>
      </div>
      
      {completedPayments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ไม่พบรายการที่ชำระแล้วในเดือนนี้
        </div>
      ) : (
        <div className="space-y-4">
          {completedPayments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">ชำระหนี้{payment.debtName}</h3>
                  <p className="text-sm text-gray-500">วันที่ชำระ: {formatDate(payment.paymentDate)}</p>
                  <div className="mt-1">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {payment.paymentType === 'minimum' ? 'ยอดขั้นต่ำ' : 'ยอดปกติ'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#3776C1]">{formatNumber(payment.amount)} บาท</p>
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
