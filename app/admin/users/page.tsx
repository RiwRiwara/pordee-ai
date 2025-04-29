"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";

import { useCustomToast } from "@/components/ui/ToastNotification";
import UserFilters from "@/components/admin/users/UserFilters";
import UsersTable from "@/components/admin/users/UsersTable";
import UserFormDrawer from "@/components/admin/users/UserFormDrawer";
import {
  User,
  UserFormData,
  PaginationInfo,
} from "@/components/admin/users/types";

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "user",
    languagePreference: "th",
    isActive: true,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { showNotification } = useCustomToast();

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);

      let url = `/api/admin/users?page=${page}&limit=${pagination.limit}`;

      // Add filters if present
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_ADMIN_API_KEY && {
            "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY,
          }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      setUsers(data.users);
      setPagination(data.pagination);
    } catch {
      showNotification(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
        "solid",
        "danger",
      );

      // Use sample data for demo
      setUsers([
        {
          _id: "1",
          username: "admin",
          email: "admin@pordee.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          languagePreference: "th",
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          username: "user1",
          email: "user1@example.com",
          firstName: "Test",
          lastName: "User",
          role: "user",
          languagePreference: "th",
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
    fetchUsers();
  }, [roleFilter, statusFilter]);

  // Handle form submission
  const handleSubmit = async (data: UserFormData) => {
    const isEditing = !isCreating;
    const url = isEditing
      ? `/api/admin/users/${formData.username}`
      : "/api/admin/users";

    const method = isEditing ? "PUT" : "POST";

    // Don't send empty password when editing
    const dataToSend = { ...data };

    if (isEditing && !dataToSend.password) {
      delete dataToSend.password;
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(process.env.NEXT_PUBLIC_ADMIN_API_KEY && {
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY,
        }),
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.error || "Operation failed");
    }

    showNotification(
      isEditing ? "ผู้ใช้อัปเดตเรียบร้อยแล้ว" : "สร้างผู้ใช้ใหม่เรียบร้อยแล้ว",
      isEditing
        ? "ข้อมูลผู้ใช้ได้รับการอัปเดตเรียบร้อยแล้ว"
        : "ผู้ใช้ใหม่ถูกสร้างเรียบร้อยแล้ว",
      "solid",
      "success",
    );

    setIsFormOpen(false);
    fetchUsers(pagination.page);
  };

  // Delete user
  const handleDelete = async (userId: string) => {
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? การกระทำนี้ไม่สามารถยกเลิกได้",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_ADMIN_API_KEY && {
            "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY,
          }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Delete failed");
      }

      showNotification(
        "ลบผู้ใช้เรียบร้อยแล้ว",
        "ผู้ใช้ถูกลบออกจากระบบเรียบร้อยแล้ว",
        "solid",
        "success",
      );

      fetchUsers(pagination.page);
    } catch {
      showNotification(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถลบผู้ใช้ได้",
        "solid",
        "danger",
      );
    }
  };

  // Open form for creating new user
  const openCreateForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "user",
      languagePreference: "th",
      isActive: true,
    });
    setIsCreating(true);
    setIsFormOpen(true);
  };

  // Open form for editing user
  const openEditForm = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
      languagePreference: user.languagePreference,
      isActive: user.isActive,
    });
    setIsCreating(false);
    setIsFormOpen(true);
  };

  // Handle form input changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    type?: string,
  ) => {
    const { name, value } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการผู้ใช้ (User Management)</h1>
          <p className="text-gray-600">จัดการบัญชีผู้ใช้ในระบบ Pordee</p>
        </div>
        <Button
          className="mt-2 md:mt-0"
          color="primary"
          onPress={openCreateForm}
        >
          + เพิ่มผู้ใช้ใหม่
        </Button>
      </div>

      <UserFilters
        roleFilter={roleFilter}
        search={search}
        setRoleFilter={setRoleFilter}
        setSearch={setSearch}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
        onSearch={() => fetchUsers()}
      />

      <UsersTable
        loading={loading}
        pagination={pagination}
        users={users}
        onDelete={handleDelete}
        onEdit={openEditForm}
        onPageChange={fetchUsers}
      />

      <UserFormDrawer
        formData={formData}
        isCreating={isCreating}
        isOpen={isFormOpen}
        onChange={handleFormChange}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
