'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Select, SelectItem } from '@heroui/select';
import { useForm, Controller } from 'react-hook-form';
import { RadioGroup, Radio } from '@heroui/radio';
import { useCustomToast } from './ToastNotification';
import { useGuest } from '@/context/GuestContext';
import { saveLocalDebt, LocalDebtItem } from '@/lib/localStorage';

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

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DebtFormData & { attachments?: Array<{ url: string; name: string; size: number; type: string }> }) => void;
  initialData?: DebtFormData;
}

const DebtFormModal: React.FC<DebtFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; size: number; type: string }>>([]);
  const { showNotification } = useCustomToast();
  const [isFormValid, setIsFormValid] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const files = Array.from(e.target.files);

    try {
      // Validate file types and sizes before uploading
      const validFiles = files.filter(file => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
          showNotification(
            'ไฟล์ไม่ถูกต้อง',
            `ไฟล์ ${file.name} ไม่ใช่ไฟล์รูปภาพหรือ PDF`,
            'solid',
            'warning'
          );
          return false;
        }

        if (file.size > maxSize) {
          showNotification(
            'ไฟล์ขนาดใหญ่เกินไป',
            `ไฟล์ ${file.name} มีขนาดใหญ่เกิน 10MB`,
            'solid',
            'warning'
          );
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      // Simulating file upload - in a real app, you'd upload to a server
      const uploadedResults = validFiles.map(file => {
        // Creating a local URL for preview
        const url = URL.createObjectURL(file);

        return {
          url,
          name: file.name,
          size: file.size,
          type: file.type
        };
      });

      // Add new uploads to state
      setUploadedFiles(prev => [...prev, ...uploadedResults]);

      // Show success notification
      showNotification(
        'อัพโหลดสำเร็จ',
        `อัพโหลดไฟล์สำเร็จ ${validFiles.length} ไฟล์`,
        'solid',
        'success'
      );
    } catch (error) {
      console.error('Upload error:', error);
      showNotification(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถอัพโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง',
        'solid',
        'danger'
      );
    } finally {
      setIsUploading(false);
      // Clear the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // On form submit
  const onSubmit = (data: DebtFormData) => {
    try {
      // Format the data as needed
      const formattedData: Omit<LocalDebtItem, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> = {
        name: data.debtName,
        debtType: data.debtType,
        paymentType: data.paymentType,
        totalAmount: data.totalAmount,
        minimumPayment: data.minimumPayment,
        interestRate: data.interestRate,
        dueDate: data.dueDate,
        paymentStatus: data.paymentStatus,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      };

      // Handle guest mode
      const isGuestMode = typeof window !== 'undefined' &&
        localStorage.getItem('guestMode') === 'true';

      if (isGuestMode) {
        // Save to localStorage in guest mode
        saveLocalDebt(formattedData);
      }

      // Pass the formatted data to the parent component
      onSave({ ...data, attachments: uploadedFiles });

      // Reset form after successful submission
      reset();
      setUploadedFiles([]);

    } catch (error) {
      console.error('Form submission error:', error);
      showNotification(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        'solid',
        'danger'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      aria-label="ฟอร์มเพิ่มรายการหนี้"
      closeButton
      scrollBehavior="inside"
      placement="center"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900/50 to-zinc-900/30",
        base: "mt-4 md:mt-0",
        closeButton: "top-3 right-3 text-foreground hover:bg-default-100",
        wrapper: "max-h-[90vh] overflow-visible"
      }}
    >
      <ModalContent>
        {(onCloseAction) => (
          <>
            <ModalHeader className="px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">เพิ่มรายการหนี้</h3>
                  <p className="text-sm text-gray-500">กรอกข้อมูลหนี้ของคุณ</p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="px-4 py-2 overflow-y-auto max-h-[60vh] md:max-h-[500px]">
              <form id="debt-form" onSubmit={handleSubmit(onSubmit)}>
                {/* File Upload Input (hidden) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/png, image/jpeg, image/jpg, application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label="อัพโหลดไฟล์สลิปหรือใบเสร็จ"
                />

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
                    onPress={triggerFileInput}
                  >
                    อัพโหลดสลิป / ใบเสร็จ
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-1">อัพโหลดสลิป / ใบเสร็จ ระบบจะอ่านข้อมูลหนี้ให้อัตโนมัติ</p>
                </div>

                {/* Display uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-6 border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium mb-2">ไฟล์ที่อัพโหลด ({uploadedFiles.length})</h4>
                    <div className="max-h-40 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="ลบไฟล์"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Debt Type Selection */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">ประเภทหนี้</label>
                  <Controller
                    control={control}
                    name="debtType"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="เลือกประเภทหนี้"
                        className="w-full border border-yellow-400 rounded-lg"
                        aria-label="เลือกประเภทหนี้"
                      >
                        {debtTypes.map((type) => (
                          <SelectItem
                            key={type.value}
                            textValue={type.label}
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>

                {/* Payment Type */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">ลักษณะหนี้</label>
                  <Controller
                    control={control}
                    name="paymentType"
                    render={({ field }) => (
                      <RadioGroup
                        {...field}
                        orientation="horizontal"
                        className="gap-4"
                      >
                        <Radio
                          value="revolving"
                          description="บัตรเครดิต / กดเงินสด"
                        >
                          หนี้หมุนเวียน
                        </Radio>
                        <Radio
                          value="installment"
                          description="ผ่อนชำระเป็นงวด"
                        >
                          หนี้ผ่อนชำระ
                        </Radio>
                      </RadioGroup>
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
                      <Input
                        {...field}
                        placeholder="เช่น บัตร KTC, สินเชื่อรถยนต์"
                        className="w-full border border-yellow-400 rounded-lg"
                      />
                    )}
                  />
                </div>

                {/* Total Amount */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">
                    {paymentType === 'revolving' ? 'วงเงิน / ยอดใช้จ่าย' : 'ยอดสินเชื่อ / ยอดคงเหลือ'}
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="col-span-2">
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
                          />
                        )}
                      />
                    </div>
                    <div className="col-span-1 pt-2">
                      <p className="text-sm">บาท</p>
                    </div>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">อัตราดอกเบี้ย</label>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-9">
                      <Controller
                        control={control}
                        name="interestRate"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="0.00"
                            type="number"
                            step="0.01"
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
                        aria-label="Percentage unit selection"
                      >
                        <SelectItem key="%" textValue="เปอร์เซ็นต์">%</SelectItem>
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
                        aria-label="เลือกวันครบกำหนดชำระ"
                      >
                        {[...Array(31)].map((_, i) => (
                          <SelectItem
                            key={i + 1}
                            textValue={`ทุกวันที่ ${i + 1}`}
                          >
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
                        aria-label="เลือกสถานะการชำระหนี้"
                      >
                        {paymentStatusOptions.map((status) => (
                          <SelectItem
                            key={status.value}
                            textValue={status.label}
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>
              </form>
            </ModalBody>

            <ModalFooter className="px-4 py-3">
              <Button
                type="submit"
                form="debt-form"
                color="primary"
                className="w-full bg-yellow-400 text-black py-4 rounded-lg font-medium text-base"
                isDisabled={!isFormValid}
                aria-label="บันทึกรายการหนี้"
              >
                บันทึกรายการหนี้
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DebtFormModal;