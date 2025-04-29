import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "admin" | "user";

interface UserInfo {
  authenticated: boolean;
  user?: {
    _id: string;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    [key: string]: any;
  };
  role?: UserRole;
  error?: string;
}

export function useRole(
  requiredRoles?: UserRole[] | null,
  redirectTo?: string,
) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkRole = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        if (redirectTo) {
          router.push(redirectTo);
        }

        return;
      }

      const data: UserInfo = await response.json();

      setUserInfo(data);

      // Check if user has required role
      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = data.user?.role || data.role;

        if (
          !data.authenticated ||
          !userRole ||
          !requiredRoles.includes(userRole)
        ) {
          if (redirectTo) {
            router.push(redirectTo);
          }
        }
      }
    } catch (error) {
      if (redirectTo) {
        router.push(redirectTo);
      }
    } finally {
      setLoading(false);
    }
  }, [router, requiredRoles, redirectTo]);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!userInfo?.authenticated) return false;

      const userRole = userInfo.user?.role || userInfo.role;

      if (!userRole) return false;

      if (Array.isArray(roles)) {
        return roles.includes(userRole);
      }

      return roles === userRole;
    },
    [userInfo],
  );

  return {
    userInfo,
    loading,
    hasRole,
    isAdmin:
      userInfo?.authenticated &&
      (userInfo.user?.role === "admin" || userInfo.role === "admin"),
    isUser:
      userInfo?.authenticated &&
      (userInfo.user?.role === "user" || userInfo.role === "user"),
    refresh: checkRole,
  };
}
