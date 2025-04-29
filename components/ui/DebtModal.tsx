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
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { FiSave, FiTrash2 } from "react-icons/fi";

import { DebtItem } from "@/components/ui/types";

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

  // Reset form when modal opens with debt data
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
  }, [isOpen, selectedDebt, reset]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Ensure all required fields are present and properly formatted
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
      backdrop="blur"
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="lg"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedDebt ? "แก้ไขรายการหนี้" : "เพิ่มรายการหนี้"}
          </h2>
        </ModalHeader>

        <ModalBody className="px-6 py-4 max-h-[70vh] overflow-y-auto">
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
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="debtType"
                >
                  ประเภทหนี้ <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="debtType"
                  render={({ field }) => (
                    <Select
                      {...field}
                      errorMessage={errors.debtType?.message}
                      id="debtType"
                      isInvalid={!!errors.debtType}
                      placeholder="เลือกประเภทหนี้"
                    >
                      <SelectItem key="บัตรเครดิต">บัตรเครดิต</SelectItem>
                      <SelectItem key="สินเชื่อ">สินเชื่อ</SelectItem>
                      <SelectItem key="อื่นๆ">อื่นๆ</SelectItem>
                    </Select>
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
                    errorMessage={errors.notes?.message}
                    id="notes"
                    isInvalid={!!errors.notes}
                    placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับหนี้รายการนี้"
                    rows={3}
                  />
                )}
              />
            </div>

            {/* End of form fields */}
          </form>
        </ModalBody>

        <ModalFooter className="px-6 py-4 border-t border-gray-200 justify-between">
          {selectedDebt && (
            <Button
              color="danger"
              isDisabled={isDeleting || isSubmitting}
              startContent={<FiTrash2 />}
              type="button"
              variant="flat"
              onPress={handleDelete}
            >
              {isDeleting ? "กำลังลบ..." : "ลบรายการหนี้"}
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              isDisabled={isSubmitting || isDeleting}
              type="button"
              variant="flat"
              onPress={onClose}
            >
              ยกเลิก
            </Button>
            <Button
              color="primary"
              isDisabled={isSubmitting || isDeleting}
              isLoading={isSubmitting}
              startContent={<FiSave />}
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
