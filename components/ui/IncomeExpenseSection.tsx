import { Button } from '@heroui/button'
import React, { useState } from 'react'
import IncomeExpenseDrawer from './IncomeExpenseDrawer'
import { useCustomToast } from './ToastNotification';
import { FaMoneyBill } from "react-icons/fa";
import { LuWallet } from "react-icons/lu";

interface IncomeExpenseSectionProps {
    monthlyIncome: string;
    monthlyExpense: string;
    disposableIncome: string;
    setIsIncomeExpenseDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function IncomeExpenseSection({ monthlyIncome, monthlyExpense, disposableIncome, setIsIncomeExpenseDrawerOpen }: IncomeExpenseSectionProps) {
    const { showNotification } = useCustomToast();
    return (
        <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-md  font-semibold">รายได้ / รายจ่าย</h2>
                <Button
                    isIconOnly
                    color="primary"
                    aria-label="Edit income/expense"
                    size="sm"
                    className="rounded-full"
                    onPress={() => setIsIncomeExpenseDrawerOpen(true)}

                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                    </svg>
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg p-3">
                    <p className="text-xs text-gray-600 text-center">รายได้ต่อเดือน</p>
                    <div className="flex items-center">
                        <span className="mr-4 flex h-10 w-12 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                            <FaMoneyBill />
                        </span>
                        <p className="text-sm  font-bold text-[#3776C1]">{monthlyIncome} THB</p>
                    </div>
                </div>

                <div className="rounded-lg  p-3">
                    <p className="text-xs text-gray-600 text-center">รายจ่ายต่อเดือน</p>
                    <div className="flex items-center">
                        <span className="mr-4 flex h-10 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                            <LuWallet />
                        </span>
                        <p className="text-sm  font-bold text-[#3776C1]">{monthlyExpense} THB</p>
                    </div>
                </div>
            </div>
            <hr className='border border-gray-200 my-2' />
            <div className="mt-0 rounded-lg gap-2 flex flex-col p-4 text-center">
                <p className="text-sm text-gray-800">เงินได้ใช้จ่ายคงเหลือ</p>
                <p className="text-xl font-bold text-yellow-500">{disposableIncome} THB</p>
            </div>


        </div>
    )
}
