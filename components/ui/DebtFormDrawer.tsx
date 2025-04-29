'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Drawer, DrawerContent, DrawerBody, DrawerFooter, DrawerHeader } from '@heroui/drawer';
import { Select, SelectItem } from '@heroui/select';
import { useForm, Controller } from 'react-hook-form';
import { RadioGroup, Radio } from '@heroui/radio';
import { useCustomToast } from './ToastNotification';

// Debt types for the dropdown
const debtTypes = [
  { label: 'บัตรเครดิต', value: 'credit_card' },
  { label: 'บัตรกดเงินสด', value: 'cash_card' },
  { label: 'สินเชื่อบุคคล', value: 'personal_loan' },
  { label: 'สินเชื่อรถยนต์', value: 'auto_loan' },
  { label: 'สินเชื่อบ้าน', value: 'mortgage_loan' },
];

// Payment status options for dropdown
const paymentStatusOptions = [
  { label: 'ปกติ', value: 'normal' },
  { label: 'ค้างชำระ / ใกล้ผิดนัด', value: 'overdue' },
];

interface DebtFormData {
  debtType: string;
  paymentType: 'installment' | 'revolving';
  debtName: string;
  totalAmount: string;
  minimumPayment: string;
  interestRate: string;
  dueDate: string;
  paymentStatus: string;
}

interface DebtFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DebtFormData) => void;
  initialData?: DebtFormData;
}

const DebtFormDrawer: React.FC<DebtFormDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const { showNotification } = useCustomToast();
  const [isFormValid, setIsFormValid] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid }, reset } = useForm<DebtFormData>({
    defaultValues: initialData || {
      debtType: '',
      paymentType: 'revolving',
      debtName: '',
      totalAmount: '',
      minimumPayment: '',
      interestRate: '',
      dueDate: '',
      paymentStatus: 'normal',
    },
    mode: 'onChange'
  });

  const paymentType = watch('paymentType');
  const allFields = watch();

  // Check if all required fields are filled
  useEffect(() => {
    const requiredFields = [
      'debtType', 'debtName', 'totalAmount',
      'minimumPayment', 'interestRate', 'dueDate'
    ];

    const allFieldsFilled = requiredFields.every(field => !!allFields[field as keyof DebtFormData]);
    setIsFormValid(allFieldsFilled);
  }, [allFields]);

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate upload and OCR processing
    setTimeout(() => {
      // Simulate data extracted from receipt
      setValue('debtType', 'credit_card');
      setValue('debtName', 'บัตร KBANK');
      setValue('totalAmount', '25000');
      setValue('minimumPayment', '2500');
      setValue('interestRate', '16');
      setValue('dueDate', '25');
      setValue('paymentStatus', 'normal');

      // Set mock upload image
      setUploadImage('/receipt-mock.jpg');
      setIsUploading(false);

      showNotification(
        'อัพโหลดสำเร็จ',
        'ระบบอ่านข้อมูลจากสลิปเรียบร้อยแล้ว',
        'solid',
        'success'
      );
    }, 2000);
  };

  const onSubmit = (data: DebtFormData) => {
    // Categorize based on debt type and payment type
    let finalData = { ...data };

    // If credit card or cash card with installment, categorize as installment debt
    if ((data.debtType === 'credit_card' || data.debtType === 'cash_card') &&
      data.paymentType === 'installment') {
      finalData.debtType = 'installment';
    }

    // If credit card or cash card with revolving, categorize as revolving debt
    if ((data.debtType === 'credit_card' || data.debtType === 'cash_card') &&
      data.paymentType === 'revolving') {
      finalData.debtType = 'revolving';
    }

    onSave(finalData);
    reset();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
      <DrawerContent className="rounded-t-xl">
        <DrawerHeader className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">รายละเอียดแผนการชำระหนี้</h2>
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              aria-label="Close"
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
          <form id="debt-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Upload Option */}
            <div className="mb-6">
              <Button
                color="primary"
                className="bg-blue-500 text-white w-full flex items-center justify-center py-3"
                startContent={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                  </svg>
                }
                isLoading={isUploading}
                onPress={handleUpload}
              >
                อัพโหลดสลิป / ใบเสร็จ
              </Button>
              <p className="text-xs text-center text-gray-500 mt-1">อัพโหลดสลิป / ใบเสร็จ ระบบจะอ่านข้อมูลหนี้ให้อัตโนมัติ</p>
            </div>
            
            <div className="text-center text-gray-500 text-sm mb-4">
              <span className="inline-block w-24 h-px bg-gray-300 mr-2 align-middle"></span>
              <span>กรอกข้อมูลด้วยตนเอง</span>
              <span className="inline-block w-24 h-px bg-gray-300 ml-2 align-middle"></span>
            </div>

            {/* Debt Type */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">ประเภทหนี้</label>
              <Controller
                control={control}
                name="debtType"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="กรุณาเลือกประเภทหนี้ของคุณ"
                    className="w-full border border-yellow-400 rounded-lg"
                  >
                    {debtTypes.map((type) => (
                      <SelectItem key={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>

            {/* Debt Name */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">ชื่อหนี้</label>
              <Controller
                control={control}
                name="debtName"
                rules={{ required: true }}
                render={({ field }) => (
                  <Input {...field} placeholder="ตัวอย่าง: ผ่อน iPhone 16 Pro" className="border border-yellow-400 rounded-lg" />
                )}
              />
            </div>

            {/* Payment Type */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">ประเภทการชำระ</label>
              <Controller
                control={control}
                name="paymentType"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <RadioGroup
                    value={value}
                    onValueChange={onChange}
                    orientation="vertical"
                    className="gap-3"
                  >
                    <Radio value="installment" className="border border-gray-200 rounded-lg p-2">
                      <div className="py-1">ผ่อนชำระรายงวด</div>
                    </Radio>
                    <Radio value="revolving" className="border border-gray-200 rounded-lg p-2">
                      <div className="py-1">จ่ายเงินคืนบางส่วน / จ่ายขั้นต่ำ</div>
                    </Radio>
                  </RadioGroup>
                )}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">ยอดเงินต้นทั้งหมด  ยอดผ่อนต่อเดือน</label>
              {paymentType === 'revolving' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Controller
                      control={control}
                      name="totalAmount"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="0"
                          type="number"
                          className="border border-yellow-400 rounded-lg"
                          endContent={<span className="text-sm text-gray-500">บาท</span>}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Controller
                      control={control}
                      name="minimumPayment"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="0"
                          type="number"
                          className="border border-yellow-400 rounded-lg"
                          endContent={<span className="text-sm text-gray-500">บาท</span>}
                        />
                      )}
                    />
                  </div>
                </div>
              ) : (
                <div className="border-l-4 border-green-500 pl-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-xs text-gray-500 self-center text-center">งวดละ</div>
                    <div>
                      <Controller
                        control={control}
                        name="minimumPayment"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="0"
                            type="number"
                            className="border border-yellow-400 rounded-lg"
                            endContent={<span className="text-sm text-gray-500">บาท</span>}
                          />
                        )}
                      />
                    </div>
                    <div className="text-xs text-gray-500 self-center">บาท</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-xs text-gray-500 self-center text-center">จาก</div>
                    <div>
                      <Controller
                        control={control}
                        name="totalAmount"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="0"
                            type="number"
                            className="border border-yellow-400 rounded-lg"
                            endContent={<span className="text-sm text-gray-500">บาท</span>}
                          />
                        )}
                      />
                    </div>
                    <div className="text-xs text-gray-500 self-center">บาท</div>
                  </div>
                </div>
              )}
            </div>

            {/* Interest Rate */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">อัตราดอกเบี้ยต่อปี (%)</label>
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="interestRate"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="0"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="border border-yellow-400 rounded-lg"
                        endContent={<span className="text-sm text-gray-500">%</span>}
                      />
                    )}
                  />
                </div>
                <div className="col-span-3">
                  <Select
                    placeholder="%"
                    className="border border-gray-200 rounded-lg"
                    selectedKeys={["%"]}
                    disableAnimation
                    isDisabled
                  >
                    <SelectItem key="%">%</SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">ยอดจ่ายขั้นต่ำ / ค่างวด</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="minimumPayment"
                    rules={{ required: paymentType === 'revolving' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="0"
                        type="number"
                        className="border border-yellow-400 rounded-lg"
                      />
                    )}
                  />
                </div>
                <div className="col-span-1 pt-2">
                  <p className="text-sm">บาท</p>
                </div>
              </div>
              
              <label className="block mb-1 font-medium">วันครบกำหนดชำระ</label>
              <Controller
                control={control}
                name="dueDate"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="เลือกวัน"
                    className="w-full border border-yellow-400 rounded-lg"
                  >
                    {[...Array(31)].map((_, i) => (
                      <SelectItem key={i + 1}>
                        ทุกวันที่ {i + 1}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>

            {/* Payment Status */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">สถานะการชำระหนี้</label>
              <Controller
                control={control}
                name="paymentStatus"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="เลือกสถานะ"
                    className="w-full border border-yellow-400 rounded-lg"
                  >
                    {paymentStatusOptions.map((status) => (
                      <SelectItem key={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>
          </form>
        </DrawerBody>
        
        <DrawerFooter className="px-4 py-3">
          <Button
            type="submit"
            form="debt-form"
            color="primary"
            className="w-full bg-yellow-400 text-black py-4 rounded-lg font-medium text-base"
            isDisabled={!isFormValid}
          >
            บันทึกรายการหนี้
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DebtFormDrawer;
