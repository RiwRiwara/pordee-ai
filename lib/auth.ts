import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// User role types
export type UserRole = "user" | "admin";

// Auth result interface
export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  role?: UserRole;
  error?: string;
}

export async function verifyToken(
  request: NextRequest,
): Promise<string | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return null;
    }

    // Verify the token
    const decoded = verify(
      token,
      process.env.NEXTAUTH_SECRET || "fallback_secret",
    ) as { userId: string };

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// Get user info from request (token, session, etc.)
export async function getUserInfo(request: NextRequest): Promise<AuthResult> {
  try {
    // First check admin token cookie (for admin web UI)
    const adminToken = request.cookies.get("admin-token")?.value;

    if (adminToken) {
      try {
        // Decode the admin token (base64 for admin tokens)
        const decodedToken = JSON.parse(
          Buffer.from(adminToken, "base64").toString(),
        );

        // Check if token has admin flag and not expired
        if (
          decodedToken &&
          decodedToken.isAdmin &&
          decodedToken.exp > Date.now()
        ) {
          return {
            authenticated: true,
            userId: decodedToken.userId,
            role: "admin",
          };
        }
      } catch (e) {}
    }

    // Check API key (for programmatic access)
    const adminKey = request.headers.get("x-admin-key");
    const validAdminKey = process.env.ADMIN_API_KEY;

    if (adminKey && validAdminKey && adminKey === validAdminKey) {
      return {
        authenticated: true,
        role: "admin",
      };
    }

    // Check JWT token (for regular API access)
    const userId = await verifyToken(request);

    if (userId) {
      return {
        authenticated: true,
        userId,
        role: "user", // Default role for authenticated users
      };
    }

    // Not authenticated
    return {
      authenticated: false,
      error: "Not authenticated",
    };
  } catch (error) {
    return {
      authenticated: false,
      error: "Authentication error",
    };
  }
}

// Check if user has admin role
export async function isAdmin(request: NextRequest) {
  const userInfo = await getUserInfo(request);

  return userInfo.authenticated && userInfo.role === "admin";
}

// Middleware wrapper for admin-only API routes
export function withAdminAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const isAdminUser = await isAdmin(request);

    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    return handler(request, ...args);
  };
}

// Middleware wrapper for role-based authentication
export function withRoleAuth(
  handler: Function,
  allowedRoles: UserRole[] = ["admin", "user"],
) {
  return async (request: NextRequest, ...args: any[]) => {
    const userInfo = await getUserInfo(request);

    if (!userInfo.authenticated) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!allowedRoles.includes(userInfo.role as UserRole)) {
      return NextResponse.json(
        {
          error: `Insufficient permissions. Required roles: ${allowedRoles.join(", ")}`,
        },
        { status: 403 },
      );
    }

    // Pass the user info to the handler as well
    request.headers.set("x-user-id", userInfo.userId || "");
    request.headers.set("x-user-role", userInfo.role || "");

    return handler(request, ...args);
  };
}
