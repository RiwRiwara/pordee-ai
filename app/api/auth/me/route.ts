import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongodb";
import User, { IUser } from "@/models/User"; // Import IUser interface
import { getUserInfo, withRoleAuth } from "@/lib/auth";

// GET - Get current user info based on token/session
export const GET = withRoleAuth(
  async (request: NextRequest) => {
    try {
      await connectToDatabase();

      // Get user info from auth helper
      const userInfo = await getUserInfo(request);

      // If authenticated but we need more user details from database
      if (userInfo.authenticated && userInfo.userId) {
        // Find user in database
        const user = await User.findById(userInfo.userId)
          .select("-passwordHash") // Exclude sensitive data
          .lean<IUser>(); // Explicitly type the lean result as IUser

        if (user) {
          return NextResponse.json({
            authenticated: true,
            user: {
              ...user,
              role: user.role || userInfo.role, // Now TypeScript recognizes `role`
            },
          });
        }
      }

      // Return the basic auth info if we couldn't get user details
      return NextResponse.json({
        authenticated: userInfo.authenticated,
        role: userInfo.role,
        ...(userInfo.error && { error: userInfo.error }),
      });
    } catch (error) {
      return NextResponse.json(
        { authenticated: false, error: "Error retrieving user information" },
        { status: 500 },
      );
    }
  },
  ["admin", "user"],
);