'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { useAuth } from '@/context/AuthContext';
import BackButton from '@/components/ui/BackButton';
import DebtFormDrawer from '@/components/ui/DebtFormDrawer';
import IncomeExpenseDrawer from '@/components/ui/IncomeExpenseDrawer';
import RiskMeter from '@/components/ui/RiskMeter';
import { useCustomToast } from '@/components/ui/ToastNotification';
import IncomeExpenseSection from '@/components/ui/IncomeExpenseSection';
import AllDebtSection from '@/components/ui/AllDebtSection';
import SummarySection from '@/components/ui/SummarySection';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState('100,000.00');
  const [monthlyExpense, setMonthlyExpense] = useState('10,000.00');
  const [disposableIncome, setDisposableIncome] = useState('90,000.00');
  const [isDebtFormOpen, setIsDebtFormOpen] = useState(false);
  const [isIncomeExpenseDrawerOpen, setIsIncomeExpenseDrawerOpen] = useState(false);
  const [debtRiskPercentage, setDebtRiskPercentage] = useState(50);
  const [debts, setDebts] = useState<any[]>([]);
  const { showNotification } = useCustomToast();

  // Calculate debt risk percentage based on debt-to-income ratio
  const calculateDebtRiskPercentage = () => {
    // Parse income and get total monthly debt payments
    const income = parseFloat(monthlyIncome.replace(/,/g, ''));

    // Calculate total monthly debt payments
    let totalMonthlyDebtPayment = 0;
    debts.forEach(debt => {
      if (debt.installmentAmount) {
        totalMonthlyDebtPayment += parseFloat(debt.installmentAmount.replace(/,/g, ''));
      }
    });

    // Calculate debt-to-income ratio (DTI)
    let debtToIncomeRatio = 0;
    if (income > 0) {
      debtToIncomeRatio = (totalMonthlyDebtPayment / income) * 100;
    }

    // Cap at 100%
    const riskPercentage = Math.min(Math.round(debtToIncomeRatio), 100);
    setDebtRiskPercentage(riskPercentage);
  };

  // Sample plan suggestions based on the mobile app screenshot
  const planSuggestions = [
    {
      id: 1,
      title: 'การเปลี่ยนกลยุทธ์การจ่ายหนี้โดยเลือกวิธี Debt Avalanche',
      description: 'เมื่อเร็วๆความสำเร็จจากคุณตี้ Snowball เป็น Debt Avalanche แทน โดยรวมจ่างหนี้ที่มีอัตราดอกเบี้ยสูงสุดก่อนทำให้ประหยัดดอกเบี้ยโดยรวมได้มากกว่า'
    },
    {
      id: 2,
      title: 'เพิ่มการจ่ายรายเดือน',
      description: 'หากเป็นไปได้ ให้เพิ่มรายเดือนเพื่อจ่ายหนี้ให้ไวขึ้น เพียงเพิ่มอีกหนึ่งพันต่อเดือนก็จะลดระยะเวลาการชำระหนี้และลดดอกเบี้ยที่ต้องจ่าย'
    },
    {
      id: 3,
      title: 'สร้างเงินช่วยฉุกเฉิน',
      description: 'ควรสะสมเงินใช้ฉุกเฉิน อย่างน้อย 3 เดือน เช่น การเก็บไว้ใช้ยามฉุกเฉินเพื่อไม่ต้องกู้เพิ่มในกรณีที่มีเหตุจำเป็นทำให้ไม่สามารถรายได้ปกติในช่วงหนึ่ง'
    }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-6 bg-blue-500 px-4 py-6 text-white">
        <div className="mb-2 flex items-center">
          <BackButton href="/" className="text-white" />
          <h1 className="ml-2 text-xl font-bold">Debt Overview</h1>
        </div>
        <p className="text-sm">ทำความเข้าใจหนี้ของคุณนะ</p>
      </div>

      {/* Summary Section */}
      <div className="mb-6 px-4">
        <SummarySection
        />
      </div>


      {/* Risk Meter */}
      <div className="mb-6 px-4">
        <RiskMeter
          riskPercentage={debtRiskPercentage}
          onPlanClick={() => {
            showNotification(
              'เร็วๆ นี้',
              'ฟีเจอร์การวางแผนจัดการหนี้กำลังอยู่ระหว่างการพัฒนา',
              'solid',
              'primary'
            );
          }}
        />
      </div>



      {/* Income/Expense Section */}
      <div className="mb-6 px-4">

        <IncomeExpenseSection
          monthlyIncome={monthlyIncome}
          monthlyExpense={monthlyExpense}
          disposableIncome={disposableIncome}
          setIsIncomeExpenseDrawerOpen={setIsIncomeExpenseDrawerOpen}
        />
      </div>

      {/* All  Debt Section */}
      <AllDebtSection
        setIsDebtFormOpen={setIsDebtFormOpen}
      />


      {/* Income Expense Drawer */}
      <IncomeExpenseDrawer
        isOpen={isIncomeExpenseDrawerOpen}
        onClose={() => setIsIncomeExpenseDrawerOpen(false)}
        initialData={{
          monthlyIncome: monthlyIncome.replace(/,/g, ''),
          monthlyExpense: monthlyExpense.replace(/,/g, '')
        }}
        onSave={(data) => {
          // Format with commas for display
          const formatNumber = (num: string) => {
            return parseFloat(num).toLocaleString('th-TH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          };

          // Update state with formatted values
          setMonthlyIncome(formatNumber(data.monthlyIncome));
          setMonthlyExpense(formatNumber(data.monthlyExpense));

          // Calculate disposable income
          const income = parseFloat(data.monthlyIncome);
          const expense = parseFloat(data.monthlyExpense);
          const disposable = income - expense;
          setDisposableIncome(formatNumber(disposable.toString()));

          // Calculate debt risk
          calculateDebtRiskPercentage();
        }}
      />

      {/* Debt Form Drawer */}
      <DebtFormDrawer
        isOpen={isDebtFormOpen}
        onClose={() => setIsDebtFormOpen(false)}
        onSave={(debtData) => {
          // Add the new debt to the state
          setDebts([...debts, debtData]);

          // Show success notification
          showNotification(
            'เพิ่มรายการหนี้สำเร็จ',
            'รายการหนี้ถูกบันทึกเรียบร้อยแล้ว',
            'solid',
            'success'
          );

          // Close the drawer
          setIsDebtFormOpen(false);

          // Recalculate debt risk percentage
          calculateDebtRiskPercentage();
        }}
      />

    </div>
  );
}
