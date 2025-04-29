import React from 'react'
import { Button } from '@heroui/button';

interface AllDebtSectionProps {
  setIsDebtFormOpen: (open: boolean) => void;
}

export default function AllDebtSection({ setIsDebtFormOpen }: AllDebtSectionProps) {
  return (
    <div>
      <div className="mb-4 px-4">
        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
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
      </div>

      {/* Installment Debt Section */}
      <div className="mb-6 px-4">
        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
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




        </div>
        {/* Add Debt Button */}
        <Button
          variant="flat"
          className="mt-2 w-full border border-dashed border-gray-300 py-3 text-gray-500"
          onPress={() => setIsDebtFormOpen(true)}
        >
          + เพิ่มรายการหนี้
        </Button>
      </div>
    </div>
  )
}
