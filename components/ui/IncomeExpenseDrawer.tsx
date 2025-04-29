'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Drawer, DrawerContent, DrawerBody, DrawerFooter, DrawerHeader } from '@heroui/drawer';
import { useForm, Controller } from 'react-hook-form';
import { useCustomToast } from './ToastNotification';
import { useGuest } from '@/context/GuestContext';

interface IncomeExpenseData {
  monthlyIncome: string;
  monthlyExpense: string;
}

interface IncomeExpenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: IncomeExpenseData) => void;
  initialData?: IncomeExpenseData;
}

const IncomeExpenseDrawer: React.FC<IncomeExpenseDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { showNotification } = useCustomToast();
  const { isGuestMode } = useGuest();
  const [uploadIncome, setUploadIncome] = useState(false);
  const [uploadExpense, setUploadExpense] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IncomeExpenseData>({
    defaultValues: initialData || {
      monthlyIncome: '',
      monthlyExpense: '',
    },
    mode: 'onChange'
  });

  const toggleUploadIncome = () => {
    setUploadIncome(!uploadIncome);
  };

  const toggleUploadExpense = () => {
    setUploadExpense(!uploadExpense);
  };

  const onSubmit = async (data: IncomeExpenseData) => {
    try {
      // Format values to ensure they're stored consistently
      const formattedData = {
        monthlyIncome: data.monthlyIncome.replace(/,/g, ''),
        monthlyExpense: data.monthlyExpense.replace(/,/g, ''),
      };

      // Call the provided onSave callback
      onSave(formattedData);

      // Show success notification
      showNotification(
        'บันทึกข้อมูลสำเร็จ',
        'ข้อมูลรายได้และรายจ่ายถูกบันทึกเรียบร้อยแล้ว',
        'solid',
        'success'
      );

      // Reset the form and close the drawer
      reset();
      onClose();
    } catch (error) {
      console.error('Error saving income/expense data:', error);
      showNotification(
        'บันทึกข้อมูลไม่สำเร็จ',
        'มีปัญหาในการบันทึกข้อมูล กรุณาลองอีกครั้ง',
        'solid',
        'danger'
      );
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      className="rounded-t-xl"
      aria-label="แก้ไขรายได้และรายจ่าย"
    >
      <DrawerContent className="rounded-t-xl">
        <DrawerHeader className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">กรอกข้อมูลรายได้ / รายจ่าย</h2>
            <Button
              isIconOnly
              variant="light"
              aria-label="ปิด"
              onPress={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
        </DrawerHeader>

        <DrawerBody className="px-4 py-4">
          <form id="income-expense-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="text-sm text-gray-500 mb-4">
              เราจะขอข้อมูลรายได้และรายจ่ายเพื่อวิเคราะห์สถานะทางการเงินและใช้วางแผนจัดการหนี้
            </div>

            {/* Monthly Income */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-500 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.41 18.09V20H10.74V18.07C9.03 17.71 7.58 16.61 7.47 14.67H9.43C9.53 15.72 10.33 16.48 12.08 16.48C13.9 16.48 14.48 15.59 14.48 14.7C14.48 13.62 13.76 12.97 11.63 12.47C9.28 11.91 7.47 10.92 7.47 8.62C7.47 6.7 8.94 5.37 10.74 5.07V3H13.41V5.07C15.05 5.41 16.28 6.67 16.38 8.4H14.42C14.34 7.25 13.63 6.52 12.08 6.52C10.6 6.52 9.68 7.23 9.68 8.33C9.68 9.37 10.57 9.89 12.59 10.38C14.61 10.87 16.68 11.76 16.68 14.46C16.68 16.55 15.06 17.76 13.41 18.09Z" />
                  </svg>
                  <h3 className="font-medium">รายได้ต่อเดือน</h3>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="h-8"
                  onPress={toggleUploadIncome}
                  startContent={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 16.5V18.75C3 19.3467 3.23705 19.919 3.65901 20.341C4.08097 20.7629 4.65326 21 5.25 21H18.75C19.3467 21 19.919 20.7629 20.341 20.341C20.7629 19.919 21 19.3467 21 18.75V16.5M16.5 12L12 16.5M12 16.5L7.5 12M12 16.5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                >
                  อัพโหลดสลิปเงินเดือน
                </Button>
              </div>

              {uploadIncome && (
                <div className="mb-3">
                  <Button
                    color="primary"
                    className="bg-blue-500 text-white w-full flex items-center justify-center py-3 mb-2"
                    startContent={
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                      </svg>
                    }
                  >
                    อัพโหลดสลิปเงินเดือน
                  </Button>
                  <p className="text-xs text-center text-gray-500">ระบบจะอ่านข้อมูลรายได้ให้อัตโนมัติ</p>
                </div>
              )}

              <Controller
                control={control}
                name="monthlyIncome"
                rules={{ required: "กรุณาระบุรายได้ต่อเดือน" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    placeholder="0.00"
                    className="border border-yellow-400 rounded-lg"
                    startContent={
                      <div className="text-default-400 text-small">฿</div>
                    }
                    endContent={
                      <div className="text-default-400 text-small">บาท</div>
                    }
                    aria-label="รายได้ต่อเดือน"
                  />
                )}
              />
              {errors.monthlyIncome && (
                <p className="mt-1 text-xs text-red-500">{errors.monthlyIncome.message}</p>
              )}
            </div>

            {/* Monthly Expense */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="font-medium">รายจ่ายต่อเดือน</h3>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="h-8"
                  onPress={toggleUploadExpense}
                  startContent={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 16.5V18.75C3 19.3467 3.23705 19.919 3.65901 20.341C4.08097 20.7629 4.65326 21 5.25 21H18.75C19.3467 21 19.919 20.7629 20.341 20.341C20.7629 19.919 21 19.3467 21 18.75V16.5M16.5 12L12 16.5M12 16.5L7.5 12M12 16.5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                >
                  อัพโหลดบิลค่าใช้จ่าย
                </Button>
              </div>

              {uploadExpense && (
                <div className="mb-3">
                  <Button
                    color="primary"
                    className="bg-blue-500 text-white w-full flex items-center justify-center py-3 mb-2"
                    startContent={
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                      </svg>
                    }
                  >
                    อัพโหลดบิลค่าใช้จ่าย
                  </Button>
                  <p className="text-xs text-center text-gray-500">ระบบจะอ่านข้อมูลรายจ่ายให้อัตโนมัติ</p>
                </div>
              )}

              <Controller
                control={control}
                name="monthlyExpense"
                rules={{ required: "กรุณาระบุรายจ่ายต่อเดือน" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    placeholder="0.00"
                    className="border border-yellow-400 rounded-lg"
                    startContent={
                      <div className="text-default-400 text-small">฿</div>
                    }
                    endContent={
                      <div className="text-default-400 text-small">บาท</div>
                    }
                    aria-label="รายจ่ายต่อเดือน"
                  />
                )}
              />
              {errors.monthlyExpense && (
                <p className="mt-1 text-xs text-red-500">{errors.monthlyExpense.message}</p>
              )}
            </div>

            {/* Summary Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">สรุปรายรับ-รายจ่าย</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">รายได้ต่อเดือน</p>
                  <p className="font-medium">-</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ค่าใช้จ่ายต่อเดือน</p>
                  <p className="font-medium">-</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">คงเหลือสำหรับชำระหนี้</p>
                <p className="font-medium">-</p>
              </div>
            </div>
          </form>
        </DrawerBody>

        <DrawerFooter className="px-4 py-3">
          <Button
            type="submit"
            form="income-expense-form"
            color="primary"
            className="w-full bg-yellow-400 text-black py-4 rounded-lg font-medium text-base"
          >
            ยืนยันข้อมูล
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default IncomeExpenseDrawer;
