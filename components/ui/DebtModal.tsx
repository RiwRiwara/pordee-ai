import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { FiSave, FiTrash2 } from "react-icons/fi";

import { DebtCategory } from "@/types/debt";

import { DebtItem } from "@/components/ui/types";
import { useTracking } from "@/lib/tracking";

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDebt: DebtItem | null;
  onSaveDebt: (debtData: any) => Promise<void>;
  onDeleteDebt: (debtId: string) => Promise<void>;
  refreshDebts: () => void;
}

export default function DebtModal({
  isOpen,
  onClose,
  selectedDebt,
  onSaveDebt,
  onDeleteDebt,
  refreshDebts,
}: DebtModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { trackDebtInputStart, trackDebtInputFinish, trackEdit } =
    useTracking();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      debtType: "",
      totalAmount: "",
      remainingAmount: "",
      interestRate: "",
      minimumPayment: "",
      paymentDueDay: "",
      startDate: "",
      estimatedPayoffDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen && selectedDebt) {
      reset({
        name: selectedDebt.name || "",
        debtType: selectedDebt.debtType || "",
        totalAmount: selectedDebt.totalAmount?.toString() || "",
        remainingAmount: selectedDebt.remainingAmount?.toString() || "",
        interestRate: selectedDebt.interestRate?.toString() || "",
        minimumPayment: selectedDebt.minimumPayment?.toString() || "",
        paymentDueDay: selectedDebt.paymentDueDay?.toString() || "",
        startDate: selectedDebt.startDate || "",
        estimatedPayoffDate: selectedDebt.estimatedPayoffDate || "",
        notes: selectedDebt.notes || "",
      });
    }

    // Track when user starts inputting debt data
    // if (isOpen) {
    //   trackDebtInputStart();
    // }
  }, [isOpen, selectedDebt, reset]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Track when user finishes inputting debt data
      trackDebtInputFinish();
      // Track as an edit
      trackEdit();
      const formattedData = {
        name: data.name,
        debtType: data.debtType,
        totalAmount: parseFloat(data.totalAmount),
        remainingAmount: parseFloat(data.remainingAmount),
        interestRate: parseFloat(data.interestRate),
        paymentDueDay: parseInt(data.paymentDueDay),
        minimumPayment: data.minimumPayment
          ? parseFloat(data.minimumPayment)
          : parseFloat("0"),
        startDate: data.startDate || undefined,
        estimatedPayoffDate: data.estimatedPayoffDate || undefined,
        notes: data.notes || "",
        attachments: selectedDebt?.attachments || [],
      };

      await onSaveDebt(formattedData);

      toast.success("บันทึกข้อมูลหนี้เรียบร้อย");
      refreshDebts();
      onClose();
    } catch (error) {
      toast.error("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDebt?._id) return;

    if (!window.confirm("คุณต้องการลบรายการหนี้นี้ใช่หรือไม่?")) {
      return;
    }

    setIsDeleting(true);
    // Track edit when deleting
    trackEdit();
    try {
      await onDeleteDebt(selectedDebt._id);
      toast.success("ลบรายการหนี้เรียบร้อย");
      refreshDebts();
      onClose();
    } catch (error) {
      toast.error("ไม่สามารถลบรายการได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      aria-describedby="debt-modal-body"
      backdrop="blur"
      isDismissable={false}
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="lg"
      onClose={onClose}
      isKeyboardDismissDisabled={true}
      // Add ARIA attributes for modal accessibility
      aria-labelledby="debt-modal-title"
    >
      <ModalContent>
        <ModalHeader className="px-6 py-4 border-b border-gray-200">
          {/* Add id to link with aria-labelledby */}
          <h2
            className="text-xl font-semibold text-gray-800"
            id="debt-modal-title"
          >
            {selectedDebt ? "แก้ไขรายการหนี้" : "เพิ่มรายการหนี้"}
          </h2>
        </ModalHeader>

        <ModalBody
          className="px-6 py-4 max-h-[70vh] overflow-y-auto"
          id="debt-modal-body"
        >
          <form className="space-y-6" id="debt-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Debt Name */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="name"
                >
                  ชื่อหนี้ <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      {...field}
                      aria-label="ชื่อหนี้"
                      errorMessage={errors.name?.message}
                      id="name"
                      isInvalid={!!errors.name}
                      placeholder="เช่น บัตรเครดิต SCB, สินเชื่อบ้าน"
                    />
                  )}
                  rules={{ required: "กรุณาระบุชื่อหนี้" }}
                />
              </div>

              {/* Debt Type */}
              <div className="space-y-2">
                <label
                  aria-label="ประเภทหนี้"
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="debtType"
                  id="debtType-label"
                >
                  ประเภทหนี้ <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="debtType"
                  render={({ field }) => (
                    <div className="relative">
                      <select
                        {...field}
                        aria-labelledby="debtType-label"
                        className={`block w-full px-3 py-2 border ${
                          errors.debtType ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        id="debtType"
                        onChange={(e) => {
                          field.onChange(e);
                          // Set default interest rate to 16% for "จ่ายคืนบางส่วน"
                          if (e.target.value === "จ่ายคืนบางส่วน") {
                            const interestRateField = document.getElementById("interestRate") as HTMLInputElement;
                            if (interestRateField) {
                              interestRateField.value = "16.00";
                              // Trigger change event to update form state
                              const event = new Event("input", { bubbles: true });
                              interestRateField.dispatchEvent(event);
                            }
                          }
                        }}
                      >
                        <option disabled value="">
                          เลือกประเภทหนี้
                        </option>
                        <option value={DebtCategory.CreditCard}>
                          {DebtCategory.CreditCard}
                        </option>
                        <option value={DebtCategory.RevolvingDebt}>
                          {DebtCategory.RevolvingDebt} (บัตรกดเงินสด)
                        </option>
                        <option value={DebtCategory.ProductInstallment}>
                          {DebtCategory.ProductInstallment} (ผ่อนสินค้า,
                          เครื่องใช้ไฟฟ้า)
                        </option>
                        <option value={DebtCategory.PersonalLoan}>
                          {DebtCategory.PersonalLoan} (กู้ยืมส่วนบุคคล)
                        </option>
                        <option value={DebtCategory.HousingLoan}>
                          {DebtCategory.HousingLoan} (ผ่อนบ้าน, คอนโด)
                        </option>
                        <option value={DebtCategory.VehicleLoan}>
                          {DebtCategory.VehicleLoan} (ผ่อนรถ, มอเตอร์ไซค์)
                        </option>
                        <option value={DebtCategory.BusinessLoan}>
                          {DebtCategory.BusinessLoan} 
                        </option>
                        <option value={DebtCategory.InformalLoan}>
                          {DebtCategory.InformalLoan} (เงินกู้นอกระบบ)
                        </option>
                        <option value="ผ่อนชำระรายงวด">
                          ผ่อนชำระรายงวด
                        </option>
                        <option value="จ่ายคืนบางส่วน">
                          จ่ายคืนบางส่วน
                        </option>
                        <option value={DebtCategory.Other}>
                          {DebtCategory.Other} (หนี้ประเภทอื่นๆ)
                        </option>
                      </select>
                      {errors.debtType && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.debtType.message}
                        </p>
                      )}
                    </div>
                  )}
                  rules={{ required: "กรุณาเลือกประเภทหนี้" }}
                />
              </div>

              {/* Total Amount */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="totalAmount"
                >
                  วงเงินทั้งหมด (THB) <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="totalAmount"
                  render={({ field }) => (
                    <Input
                      {...field}
                      aria-label="วงเงินทั้งหมด"
                      errorMessage={errors.totalAmount?.message}
                      id="totalAmount"
                      isInvalid={!!errors.totalAmount}
                      placeholder="0.00"
                      type="text"
                    />
                  )}
                  rules={{
                    required: "กรุณาระบุวงเงิน",
                    pattern: {
                      value: /^[0-9]*\.?[0-9]*$/,
                      message: "กรุณาระบุตัวเลขเท่านั้น",
                    },
                  }}
                />
              </div>

              {/* Remaining Amount */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="remainingAmount"
                >
                  ยอดคงเหลือ (THB) <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="remainingAmount"
                  render={({ field }) => (
                    <Input
                      {...field}
                      aria-label="ยอดคงเหลือ"
                      errorMessage={errors.remainingAmount?.message}
                      id="remainingAmount"
                      isInvalid={!!errors.remainingAmount}
                      placeholder="0.00"
                      type="text"
                    />
                  )}
                  rules={{
                    required: "กรุณาระบุยอดคงเหลือ",
                    pattern: {
                      value: /^[0-9]*\.?[0-9]*$/,
                      message: "กรุณาระบุตัวเลขเท่านั้น",
                    },
                  }}
                />
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="interestRate"
                >
                  อัตราดอกเบี้ย (%) <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="interestRate"
                  render={({ field }) => (
                    <Input
                      {...field}
                      aria-label="อัตราดอกเบี้ย"
                      errorMessage={errors.interestRate?.message}
                      id="interestRate"
                      isInvalid={!!errors.interestRate}
                      placeholder="0.00"
                      type="text"
                    />
                  )}
                  rules={{
                    required: "กรุณาระบุอัตราดอกเบี้ย",
                    pattern: {
                      value: /^[0-9]*\.?[0-9]*$/,
                      message: "กรุณาระบุตัวเลขเท่านั้น",
                    },
                  }}
                />
              </div>

              {/* Minimum Payment */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="minimumPayment"
                >
                  ค่างวด/เดือน (THB) <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="minimumPayment"
                  render={({ field }) => (
                    <Input
                      {...field}
                      aria-label="ค่างวดต่อเดือน"
                      errorMessage={errors.minimumPayment?.message}
                      id="minimumPayment"
                      isInvalid={!!errors.minimumPayment}
                      placeholder="0.00"
                      type="text"
                    />
                  )}
                  rules={{
                    required: "กรุณาระบุค่างวด/เดือน",
                    pattern: {
                      value: /^[0-9]*\.?[0-9]*$/,
                      message: "กรุณาระบุตัวเลขเท่านั้น",
                    },
                  }}
                />
              </div>

              {/* Payment Due Day */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="paymentDueDay"
                >
                  วันที่ชำระ (ของทุกเดือน){" "}
                  <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="paymentDueDay"
                  render={({ field }) => (
                    <Input
                      {...field}
                      aria-label="วันที่ชำระของทุกเดือน"
                      errorMessage={errors.paymentDueDay?.message}
                      id="paymentDueDay"
                      isInvalid={!!errors.paymentDueDay}
                      max={31}
                      min={1}
                      placeholder="15"
                      type="number"
                    />
                  )}
                  rules={{
                    required: "กรุณาระบุวันที่ชำระ",
                    min: {
                      value: 1,
                      message: "ต้องเป็นวันที่ 1-31 เท่านั้น",
                    },
                    max: {
                      value: 31,
                      message: "ต้องเป็นวันที่ 1-31 เท่านั้น",
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "กรุณาระบุตัวเลขเท่านั้น",
                    },
                  }}
                />
              </div>

              {/* Debt Type */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="debtType"
                >
                  ประเภทหนี้ *
                </label>
                <Controller
                  control={control}
                  name="debtType"
                  render={({ field }) => (
                    <Select
                      required
                      aria-label="ประเภทหนี้"
                      className="w-full"
                      errorMessage={errors.debtType?.message}
                      id="debtType"
                      isInvalid={!!errors.debtType}
                      placeholder="เลือกประเภทหนี้"
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];

                        if (selectedKey) {
                          field.onChange(selectedKey.toString());
                        }
                      }}
                    >
                      <SelectItem key={DebtCategory.RevolvingDebt}>
                        {DebtCategory.RevolvingDebt} (บัตรเครดิต, บัตรกดเงินสด)
                      </SelectItem>
                      <SelectItem key={DebtCategory.ProductInstallment}>
                        {DebtCategory.ProductInstallment} (ผ่อนสินค้า,
                        เครื่องใช้ไฟฟ้า)
                      </SelectItem>
                      <SelectItem key={DebtCategory.PersonalLoan}>
                        {DebtCategory.PersonalLoan} (กู้ยืมส่วนบุคคล)
                      </SelectItem>
                      <SelectItem key={DebtCategory.HousingLoan}>
                        {DebtCategory.HousingLoan} (ผ่อนบ้าน, คอนโด)
                      </SelectItem>
                      <SelectItem key={DebtCategory.VehicleLoan}>
                        {DebtCategory.VehicleLoan} (ผ่อนรถ, มอเตอร์ไซค์)
                      </SelectItem>
                      <SelectItem key={DebtCategory.InformalLoan}>
                        {DebtCategory.InformalLoan} (เงินกู้นอกระบบ)
                      </SelectItem>
                      <SelectItem key={DebtCategory.Other}>
                        {DebtCategory.Other} (หนี้ประเภทอื่นๆ)
                      </SelectItem>
                    </Select>
                  )}
                  rules={{ required: "กรุณาระบุประเภทหนี้" }}
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="startDate"
                >
                  วันที่เริ่มหนี้
                </label>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <Input
                      {...field}
                      aria-label="วันที่เริ่มหนี้"
                      errorMessage={errors.startDate?.message}
                      id="startDate"
                      isInvalid={!!errors.startDate}
                      type="date"
                    />
                  )}
                />
              </div>

              {/* Estimated Payoff Date */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="estimatedPayoffDate"
                >
                  วันที่คาดว่าจะชำระหมด
                </label>
                <Controller
                  control={control}
                  name="estimatedPayoffDate"
                  render={({ field }) => (
                    <Input
                      {...field}
                      aria-label="วันที่คาดว่าจะชำระหนี้หมด"
                      errorMessage={errors.estimatedPayoffDate?.message}
                      id="estimatedPayoffDate"
                      isInvalid={!!errors.estimatedPayoffDate}
                      type="date"
                    />
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="notes"
              >
                หมายเหตุ
              </label>
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    aria-label="หมายเหตุเกี่ยวกับหนี้"
                    errorMessage={errors.notes?.message}
                    id="notes"
                    isInvalid={!!errors.notes}
                    placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับหนี้รายการนี้"
                    rows={3}
                  />
                )}
              />
            </div>
          </form>
        </ModalBody>

        <ModalFooter className="px-6 py-4 border-t border-gray-200 justify-between">
          {selectedDebt && (
            <Button
              color="danger"
              isDisabled={isDeleting || isSubmitting}
              startContent={<FiTrash2 aria-hidden="true" />}
              type="button"
              variant="flat"
              onPress={handleDelete}
              // Add aria-label for accessibility
              aria-label={isDeleting ? "กำลังลบรายการหนี้" : "ลบรายการหนี้"}
            >
              {isDeleting ? "กำลังลบ..." : "ลบรายการหนี้"}
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              aria-label="ยกเลิกการแก้ไขหนี้"
              isDisabled={isSubmitting || isDeleting}
              type="button"
              variant="flat"
              onPress={onClose}
            >
              ยกเลิก
            </Button>
            <Button
              aria-label={isSubmitting ? "กำลังบันทึกหนี้" : "บันทึกหนี้"}
              color="primary"
              isDisabled={isSubmitting || isDeleting}
              isLoading={isSubmitting}
              startContent={<FiSave aria-hidden="true" />}
              type="button"
              onPress={() => handleSubmit(onSubmit)()}
            >
              บันทึก
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
