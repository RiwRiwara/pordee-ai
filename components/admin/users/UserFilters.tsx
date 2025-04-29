import React from "react";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

interface UserFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onSearch: () => void;
}

export default function UserFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onSearch,
}: UserFiltersProps) {
  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="search"
          >
            ค้นหา
          </label>
          <Input
            className="w-full"
            endContent={
              <button
                className="text-gray-400 hover:text-primary"
                onClick={onSearch}
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    fillRule="evenodd"
                  />
                </svg>
              </button>
            }
            id="search"
            placeholder="ค้นหาโดยชื่อ อีเมล หรือชื่อผู้ใช้"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="statusFilter"
          >
            สถานะ
          </label>
          <Select
            className="w-full"
            id="statusFilter"
            placeholder="ทั้งหมด"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <SelectItem key="" textValue="ทั้งหมด">
              ทั้งหมด
            </SelectItem>
            <SelectItem key="active" textValue="เปิดใช้งาน">
              เปิดใช้งาน
            </SelectItem>
            <SelectItem key="inactive" textValue="ปิดใช้งาน">
              ปิดใช้งาน
            </SelectItem>
          </Select>
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="roleFilter"
          >
            บทบาท
          </label>
          <Select
            className="w-full"
            id="roleFilter"
            placeholder="ทั้งหมด"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <SelectItem key="" textValue="ทั้งหมด">
              ทั้งหมด
            </SelectItem>
            <SelectItem key="user" textValue="ผู้ใช้">
              ผู้ใช้
            </SelectItem>
            <SelectItem key="admin" textValue="ผู้ดูแลระบบ">
              ผู้ดูแลระบบ
            </SelectItem>
          </Select>
        </div>
      </div>
    </div>
  );
}
