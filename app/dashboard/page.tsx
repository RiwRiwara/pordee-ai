'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { useAuth } from '@/context/AuthContext';
import BackButton from '@/components/ui/BackButton';
import DebtFormDrawer from '@/components/ui/DebtFormDrawer';
import { useCustomToast } from '@/components/ui/ToastNotification';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState('100,000.00');
  const [monthlyExpense, setMonthlyExpense] = useState('10,000.00');
  const [disposableIncome, setDisposableIncome] = useState('90,000.00');
  const [isDebtFormOpen, setIsDebtFormOpen] = useState(false);
  const [debts, setDebts] = useState<any[]>([]);
  const { showNotification } = useCustomToast();

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

      {/* Debt Summary Box */}
      <div className="mb-6 px-4">
        <div className="overflow-hidden rounded-lg border-2 border-blue-200">
          {/* Debt Summary Header */}
          <div className="flex cursor-pointer items-center justify-between bg-blue-500 px-4 py-3 text-white">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5">
                <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75c-1.036 0-1.875-.84-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75C3.84 21.75 3 20.91 3 19.875v-6.75z" />
              </svg>
              <h3 className="font-medium">สรุปรายงาน</h3>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Debt Summary Content */}
          <div className="grid grid-cols-2 gap-4 bg-white p-4">
            <div>
              <p className="text-xs text-gray-500">หนี้ทั้งหมด</p>
              <p className="font-semibold">2 ก้อน</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ยอดหนี้รวม</p>
              <p className="font-semibold">130,001.00 บาท</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ยอดจ่ายรายเดือน</p>
              <p className="text-yellow-500 font-semibold">5,000.00 บาท</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">อัตราดอกเบี้ยเฉลี่ย</p>
              <p className="font-semibold">8.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Meter */}
      <div className="mb-6 px-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-medium">ระดับความเสี่ยงของคุณ</h3>
          <p className="mb-1 text-xs text-gray-500">Debt-to-Income Ratio (เกณฑ์ปกติ)</p>
          
          {/* Gauge Chart */}
          <div className="relative mx-auto mb-2 h-20 w-40">
            {/* Gauge Background */}
            <div className="absolute h-10 w-full overflow-hidden rounded-t-full">
              <div className="h-full w-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"></div>
            </div>
            
            {/* Gauge Needle */}
            <div className="absolute left-1/2 top-0 h-12 w-1 -translate-x-1/2 transform">
              <div className="h-10 w-1 origin-bottom transform bg-gray-800"></div>
              <div className="mx-auto mt-1 h-3 w-3 rounded-full bg-gray-800"></div>
            </div>
            
            {/* Gauge Label */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform">
              <p className="text-center text-xl font-bold text-red-500">0%</p>
              <p className="text-center text-xs">(ยังไม่มี)</p>
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-500">การคำนวณอัตราส่วนหนี้ต่อรายได้อยู่ในเกณฑ์ปกติ</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-6 px-4">
        <div className="rounded-lg bg-gray-100 p-4">
          <h3 className="mb-1 text-sm font-medium">AI Insight</h3>
          <p className="text-xs text-gray-600">การวิเคราะห์สถานะหนี้ของคุณ เมื่อ AI ตรวจสอบพบแล้ว คุณคือ</p>
        </div>
      </div>

      {/* Start Planning Button */}
      <div className="mb-6 px-4">
        <Button 
          color="primary" 
          className="w-full py-3"
          onPress={() => {}}
        >
          เริ่มวางแผนชำระหนี้
        </Button>
      </div>

      {/* Income/Expense Section */}
      <div className="mb-6 px-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">รายได้ / รายจ่าย</h2>
          <Button 
            isIconOnly 
            color="primary" 
            aria-label="Edit income/expense"
            size="sm"
            className="rounded-full"
            onPress={() => {
              showNotification(
                'อยู่ระหว่างการพัฒนา',
                'การแก้ไขรายได้/รายจ่ายกำลังอยู่ระหว่างการพัฒนา',
                'flat',
                'primary'
              );
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
            </svg>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-yellow-100 p-3">
            <p className="text-xs text-gray-600">รายได้ต่อเดือน</p>
            <div className="flex items-center">
              <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-200 text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                  <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
                </svg>
              </span>
              <p className="text-lg font-bold">{monthlyIncome} THB</p>
            </div>
          </div>
          
          <div className="rounded-lg bg-blue-100 p-3">
            <p className="text-xs text-gray-600">รายจ่ายต่อเดือน</p>
            <div className="flex items-center">
              <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M2.273 5.625A4.483 4.483 0 015.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 3H5.25a3 3 0 00-2.977 2.625zM2.273 8.625A4.483 4.483 0 015.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 6H5.25a3 3 0 00-2.977 2.625zM5.25 9a3 3 0 00-3 3v6a3 3 0 003 3h13.5a3 3 0 003-3v-6a3 3 0 00-3-3H15a.75.75 0 00-.75.75 2.25 2.25 0 01-4.5 0A.75.75 0 009 9H5.25z" />
                </svg>
              </span>
              <p className="text-lg font-bold">{monthlyExpense} THB</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 rounded-lg bg-yellow-400 p-4 text-center">
          <p className="text-sm text-gray-800">เงินได้ใช้จ่ายคงเหลือ</p>
          <p className="text-xl font-bold text-gray-800">{disposableIncome} THB</p>
        </div>

        <div className="mt-4 flex w-full">
          <Button 
            color="primary" 
            className="w-full py-3"
            onPress={() => {}}
          >
            รายการเงินคงเหลือ
          </Button>
        </div>
      </div>

      {/* Revolving Debt Section */}
      <div className="mb-4 px-4">
        <h2 className="mb-3 text-lg font-semibold">หนี้หมุนเวียน (Revolving Debt)</h2>
        
        {/* Credit Card 1 */}
        <div className="mb-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">บัตร KBANK</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">วันที่ชำระ:</span>
                <span className="ml-1 text-sm font-medium">ทุกวันที่ 25</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">25,000 THB</p>
            </div>
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ขั้นต่ำต่อเดือน:</p>
              <p className="font-medium">2,500 THB</p>
            </div>
            <div className="flex h-8 items-center justify-center rounded-md bg-blue-500 px-3 text-white">
              <p className="text-sm font-bold">16%</p>
            </div>
          </div>
        </div>
        
        {/* Credit Card 2 */}
        <div className="mb-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">บัตร Speedy Cash</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">วันที่ชำระ:</span>
                <span className="ml-1 text-sm font-medium">ทุกวันที่ 20</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">18,000 THB</p>
            </div>
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ขั้นต่ำต่อเดือน:</p>
              <p className="font-medium">1,500 THB</p>
            </div>
            <div className="flex h-8 items-center justify-center rounded-md bg-blue-600 px-3 text-white">
              <p className="text-sm font-bold">20%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Installment Debt Section */}
      <div className="mb-6 px-4">
        <h2 className="mb-3 text-lg font-semibold">หนี้ส่งผ่อน (Installment Debt)</h2>
        
        {/* Installment 1 */}
        <div className="mb-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">iPhone</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">วันที่ชำระ:</span>
                <span className="ml-1 text-sm font-medium">ทุกวันที่ 15</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">12,000 THB</p>
            </div>
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ค่าผ่อนต่อเดือน:</p>
              <p className="font-medium">1,000 THB</p>
            </div>
            <div className="flex h-8 items-center justify-center rounded-md bg-green-500 px-3 text-white">
              <p className="text-sm font-bold">0%</p>
            </div>
          </div>
        </div>
        
        {/* Add Debt Button */}
        <Button 
          variant="flat" 
          className="mt-2 w-full border border-dashed border-gray-300 py-3 text-gray-500"
          onPress={() => setIsDebtFormOpen(true)}
        >
          + เพิ่มรายการหนี้
        </Button>
        
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
          }}
        />
      </div>
    </div>
  );
}
