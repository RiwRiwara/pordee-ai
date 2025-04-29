export interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
  languagePreference: "th" | "en";
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface UserFormData {
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
  languagePreference: "th" | "en";
  isActive: boolean;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
