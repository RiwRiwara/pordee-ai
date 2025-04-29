import React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Drawer } from "@heroui/drawer";

import { UserFormData } from "./types";

import { useCustomToast } from "@/components/ui/ToastNotification";

interface UserFormDrawerProps {
  isOpen: boolean;
  isCreating: boolean;
  formData: UserFormData;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    type?: string,
  ) => void;
}

export default function UserFormDrawer({
  isOpen,
  isCreating,
  formData,
  onClose,
  onSubmit,
  onChange,
}: UserFormDrawerProps) {
  const { showNotification } = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch {
      showNotification(
        "เกิดข้อผิดพลาด",
        "มีบางอย่างผิดพลาด กรุณาลองอีกครั้ง",
        "solid",
        "danger",
      );
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
      <div className="h-full bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isCreating ? "เพิ่มผู้ใช้ใหม่" : "แก้ไขข้อมูลผู้ใช้"}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="username"
            >
              ชื่อผู้ใช้ <span className="text-red-500">*</span>
            </label>
            <Input
              required
              className="mt-1 w-full"
              disabled={!isCreating}
              id="username"
              name="username"
              placeholder="ชื่อผู้ใช้"
              value={formData.username}
              onChange={onChange}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              อีเมล <span className="text-red-500">*</span>
            </label>
            <Input
              required
              className="mt-1 w-full"
              id="email"
              name="email"
              placeholder="อีเมล"
              type="email"
              value={formData.email}
              onChange={onChange}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              {isCreating
                ? "รหัสผ่าน"
                : "รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)"}
              {isCreating && <span className="text-red-500"> *</span>}
            </label>
            <Input
              className="mt-1 w-full"
              id="password"
              name="password"
              placeholder="รหัสผ่าน"
              required={isCreating}
              type="password"
              value={formData.password}
              onChange={onChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="firstName"
              >
                ชื่อ
              </label>
              <Input
                className="mt-1 w-full"
                id="firstName"
                name="firstName"
                placeholder="ชื่อ"
                value={formData.firstName}
                onChange={onChange}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="lastName"
              >
                นามสกุล
              </label>
              <Input
                className="mt-1 w-full"
                id="lastName"
                name="lastName"
                placeholder="นามสกุล"
                value={formData.lastName}
                onChange={onChange}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="role"
            >
              บทบาท <span className="text-red-500">*</span>
            </label>
            <Select
              required
              className="mt-1 w-full"
              id="role"
              name="role"
              value={formData.role}
              onChange={onChange}
            >
              <SelectItem key="user" textValue="ผู้ใช้ทั่วไป">
                ผู้ใช้ทั่วไป
              </SelectItem>
              <SelectItem key="admin" textValue="ผู้ดูแลระบบ">
                ผู้ดูแลระบบ
              </SelectItem>
            </Select>
          </div>

          <div>
            <label
              className="block text-sm font-medium text eigenaar-700"
              htmlFor="languagePreference"
            >
              ภาษา <span className="text-red-500">*</span>
            </label>
            <Select
              required
              className="mt-1 w-full"
              id="languagePreference"
              name="languagePreference"
              value={formData.languagePreference}
              onChange={onChange}
            >
              <SelectItem key="th" textValue="ไทย">
                ไทย
              </SelectItem>
              <SelectItem key="en" textValue="อังกฤษ">
                อังกฤษ
              </SelectItem>
            </Select>
          </div>

          <div className="flex items-center">
            <input
              checked={formData.isActive}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              id="isActive"
              name="isActive"
              type="checkbox"
              onChange={(e) => onChange(e, "checkbox")}
            />
            <label
              className="ml-2 block text-sm text-gray-900"
              htmlFor="isActive"
            >
              เปิดใช้งาน
            </label>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button color="default" variant="flat" onPress={onClose}>
              ยกเลิก
            </Button>
            <Button color="primary" type="submit">
              {isCreating ? "สร้างผู้ใช้" : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
