"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

import { useCustomToast } from "@/components/ui/ToastNotification";

interface DebtData {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  name: string;
  debtType: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  paymentDueDay: number;
  minimumPayment?: number;
  startDate?: string;
  estimatedPayoffDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DebtsAdmin() {
  const [debts, setDebts] = useState<DebtData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [debtTypeFilter, setDebtTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { showNotification } = useCustomToast();

  // Fetch debts
  const fetchDebts = async (page = 1) => {
    try {
      setLoading(true);

      let url = `/api/admin/debts?page=${page}&limit=${pagination.limit}`;

      // Add filters if present
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (debtTypeFilter) url += `&debtType=${debtTypeFilter}`;
      if (statusFilter)
        url += `&isActive=${statusFilter === "active" ? "true" : "false"}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_ADMIN_API_KEY && {
            "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY,
          }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch debts");
      }

      const data = await response.json();

      setDebts(data.debts);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching debts:", err);
      setError("Failed to load debts");

      // Use sample data for demo
      setDebts([
        {
          _id: "1",
          userId: {
            _id: "1",
            username: "user1",
            email: "user1@example.com",
          },
          name: "บัตร KBANK",
          debtType: "credit_card",
          totalAmount: 25000,
          remainingAmount: 22500,
          interestRate: 16,
          paymentDueDay: 25,
          minimumPayment: 2500,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          userId: {
            _id: "1",
            username: "user1",
            email: "user1@example.com",
          },
          name: "iPhone 14 Pro",
          debtType: "installment",
          totalAmount: 40000,
          remainingAmount: 30000,
          interestRate: 0,
          paymentDueDay: 15,
          minimumPayment: 3500,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ]);

      setPagination({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [debtTypeFilter, statusFilter]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get Thai name for debt type
  const getDebtTypeName = (type: string) => {
    switch (type) {
      case "credit_card":
        return "บัตรเครดิต";
      case "cash_card":
        return "บัตรกดเงินสด";
      case "personal_loan":
        return "สินเชื่อบุคคล";
      case "auto_loan":
        return "สินเชื่อรถยนต์";
      case "mortgage_loan":
        return "สินเชื่อบ้าน";
      case "installment":
        return "ผ่อนสินค้า";
      case "revolving":
        return "หนี้หมุนเวียน";
      default:
        return type;
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            จัดการข้อมูลหนี้ (Debt Management)
          </h1>
          <p className="text-gray-600">
            ดู, แก้ไข, และจัดการข้อมูลหนี้ของผู้ใช้ในระบบ
          </p>
        </div>
      </div>

      {/* Filters */}
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
                  onClick={() => fetchDebts()}
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
              placeholder="ค้นหาโดยชื่อหนี้หรืออีเมลผู้ใช้"
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
              <SelectItem key="" textValue="">
                ทั้งหมด
              </SelectItem>
              <SelectItem key="active" textValue="active">
                เปิดใช้งาน
              </SelectItem>
              <SelectItem key="inactive" textValue="inactive">
                ปิดใช้งาน
              </SelectItem>
            </Select>
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="debtTypeFilter"
            >
              ประเภทหนี้
            </label>
            <Select
              className="w-full"
              id="debtTypeFilter"
              placeholder="ทั้งหมด"
              value={debtTypeFilter}
              onChange={(e) => setDebtTypeFilter(e.target.value)}
            >
              <SelectItem key="" textValue="">
                ทั้งหมด
              </SelectItem>
              <SelectItem key="credit_card" textValue="credit_card">
                บัตรเครดิต
              </SelectItem>
              <SelectItem key="cash_card" textValue="cash_card">
                บัตรกดเงินสด
              </SelectItem>
              <SelectItem key="personal_loan" textValue="personal_loan">
                สินเชื่อบุคคล
              </SelectItem>
              <SelectItem key="auto_loan" textValue="auto_loan">
                สินเชื่อรถยนต์
              </SelectItem>
              <SelectItem key="mortgage_loan" textValue="mortgage_loan">
                สินเชื่อบ้าน
              </SelectItem>
              <SelectItem key="installment" textValue="installment">
                ผ่อนสินค้า
              </SelectItem>
              <SelectItem key="revolving" textValue="revolving">
                หนี้หมุนเวียน
              </SelectItem>
            </Select>
          </div>
        </div>
      </div>

      {/* Debts Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ชื่อหนี้
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ผู้ใช้
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ประเภท
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ยอดเงิน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ดอกเบี้ย
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  วันครบกำหนด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  สถานะ
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
                    colSpan={8}
                  >
                    กำลังโหลด...
                  </td>
                </tr>
              ) : debts.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-4 text-center text-sm text-gray-500"
                    colSpan={8}
                  >
                    ไม่พบข้อมูลหนี้
                  </td>
                </tr>
              ) : (
                debts.map((debt) => (
                  <tr key={debt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {debt.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {debt.userId.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        {debt.userId.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          debt.debtType === "revolving" ||
                          debt.debtType === "credit_card" ||
                          debt.debtType === "cash_card"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {getDebtTypeName(debt.debtType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(debt.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        คงเหลือ: {formatCurrency(debt.remainingAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {debt.interestRate}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ทุกวันที่ {debt.paymentDueDay}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          debt.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {debt.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Button
                        className="mr-2"
                        color="primary"
                        size="sm"
                        variant="flat"
                        onPress={() => {
                          showNotification(
                            "ฟีเจอร์กำลังพัฒนา",
                            "แก้ไขข้อมูลหนี้อยู่ระหว่างการพัฒนา",
                            "flat",
                            "primary",
                          );
                        }}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        variant="flat"
                        onPress={() => {
                          showNotification(
                            "ฟีเจอร์กำลังพัฒนา",
                            "ลบข้อมูลหนี้อยู่ระหว่างการพัฒนา",
                            "flat",
                            "primary",
                          );
                        }}
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
      </div>
    </div>
  );
}
