import React from "react";
import { Button } from "@heroui/button";

import { User, PaginationInfo } from "./types";

interface UsersTableProps {
  users: User[];
  loading: boolean;
  pagination: PaginationInfo;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPageChange: (page: number) => void;
}

export default function UsersTable({
  users,
  loading,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}: UsersTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                ผู้ใช้
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                อีเมล
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                บทบาท
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                ภาษา
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                วันที่สร้าง
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  className="px-6 py-4 text-center text-sm text-gray-500"
                  colSpan={7}
                >
                  กำลังโหลด...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-4 text-center text-sm text-gray-500"
                  colSpan={7}
                >
                  ไม่พบข้อมูลผู้ใช้
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 text-center">
                        <span className="inline-block pt-2 text-lg font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.firstName || ""} {user.lastName || ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.languagePreference === "th" ? "ไทย" : "อังกฤษ"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Button
                      className="mr-2"
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={() => onEdit(user)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      variant="flat"
                      onPress={() => onDelete(user._id)}
                    >
                      ลบ
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              isDisabled={pagination.page === 1}
              size="sm"
              variant="flat"
              onPress={() => onPageChange(pagination.page - 1)}
            >
              ก่อนหน้า
            </Button>
            <Button
              isDisabled={pagination.page === pagination.totalPages}
              size="sm"
              variant="flat"
              onPress={() => onPageChange(pagination.page + 1)}
            >
              ถัดไป
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                แสดง{" "}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                ถึง{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}
                </span>{" "}
                จากทั้งหมด{" "}
                <span className="font-medium">{pagination.total}</span> รายการ
              </p>
            </div>
            <div>
              <nav
                aria-label="Pagination"
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              >
                <button
                  className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                    pagination.page === 1 ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={pagination.page === 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      fillRule="evenodd"
                    />
                  </svg>
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium ${
                      pagination.page === i + 1
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white text-gray-500 Hover:bg-gray-50"
                    }`}
                    onClick={() => onPageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                    pagination.page === pagination.totalPages
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => onPageChange(pagination.page + 1)}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      fillRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
