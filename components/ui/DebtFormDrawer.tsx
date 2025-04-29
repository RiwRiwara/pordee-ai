'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Drawer, DrawerContent, DrawerBody, DrawerFooter, DrawerHeader } from '@heroui/drawer';
import { Select, SelectItem } from '@heroui/select';
import { useForm, Controller } from 'react-hook-form';
import { RadioGroup, Radio } from '@heroui/radio';
import { useCustomToast } from './ToastNotification';
import { useGuest } from '@/context/GuestContext';
import { saveLocalDebt } from '@/lib/localStorage';

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
  onSave: (data: DebtFormData & { attachments?: Array<{ url: string; name: string; size: number; type: string }> }) => void;
  initialData?: DebtFormData;
}

const DebtFormDrawer: React.FC<DebtFormDrawerProps> = ({
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
      
      // Create FormData with all valid files
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Send files to upload API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important for auth cookies
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      // Add the new files to our state
      setUploadedFiles(prev => [...prev, ...data.files]);
      
      // Attempt to extract data from uploaded files (in a real implementation, this would use OCR)
      // For demonstration, we're just checking file types to simulate OCR extraction
      const firstFile = validFiles[0];
      if (firstFile && firstFile.type.includes('image/')) {
        // This simulates extracting data from an image receipt
        // In a real OCR implementation, this would analyze the image content
        showNotification(
          'กำลังประมวลผลข้อมูล',
          'กำลังวิเคราะห์ข้อมูลจากรูปภาพ...',
          'solid',
          'primary'
        );
      }
      
      showNotification(
        'อัพโหลดสำเร็จ',
        `อัพโหลดไฟล์สำเร็จ ${files.length} ไฟล์`,
        'solid',
        'success'
      );
    } catch (error) {
      console.error('Upload error:', error);
      showNotification(
        'อัพโหลดไม่สำเร็จ',
        'มีปัญหาในการอัพโหลดไฟล์ กรุณาลองอีกครั้ง',
        'solid',
        'danger'
      );
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Get guest mode status
  const { isGuestMode } = useGuest();

  const onSubmit = async (data: DebtFormData) => {
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
    
    // Add the uploaded files to the submitted data
    const enhancedData = {
      ...finalData,
      attachments: uploadedFiles
    };

    try {
      if (isGuestMode) {
        // Save to localStorage for guest mode
        const savedDebt = saveLocalDebt({
          name: finalData.debtName, // Map debtName to name field for localStorage
          debtType: finalData.debtType,
          paymentType: finalData.paymentType,
          totalAmount: finalData.totalAmount,
          minimumPayment: finalData.minimumPayment,
          interestRate: finalData.interestRate,
          dueDate: finalData.dueDate,
          paymentStatus: finalData.paymentStatus,
          attachments: uploadedFiles
        });

        showNotification(
          'บันทึกข้อมูลสำเร็จ',
          'บันทึกข้อมูลหนี้สำเร็จในโหมดผู้เยี่ยมชม',
          'solid',
          'success'
        );
      } else {
        // For authenticated users, submit via the onSave function
        // which will handle API calls
      }

      onSave(enhancedData);
      reset();
      setUploadedFiles([]);
      onClose();
    } catch (error) {
      console.error('Error saving debt data:', error);
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
      aria-label="ฟอร์มเพิ่มรายการหนี้"
    >
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
                        <div className="truncate max-w-[180px]">
                          <div className="text-sm truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</div>
                        </div>
                      </div>
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="light" 
                        color="danger"
                        onPress={() => removeFile(index)}
                        aria-label="ลบไฟล์"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
                    aria-label="เลือกประเภทหนี้"
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
                    aria-label="ประเภทการชำระ"
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
                    aria-label="Percentage unit selection"
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
                    aria-label="เลือกวันครบกำหนดชำระ"
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
                    aria-label="เลือกสถานะการชำระหนี้"
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
