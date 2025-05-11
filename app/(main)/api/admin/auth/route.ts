import { NextRequest, NextResponse } from "next/server";

// POST - Admin login with hardcoded credentials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "11234";

    // Check if credentials match
    if (username === adminUsername && password === adminPassword) {
      // Create a simple token string for admin - not using JWT due to Edge runtime limitations
      // In a production app, you'd want to use a more secure approach that works with Edge
      const token = Buffer.from(
        JSON.stringify({
          userId: "admin-user",
          role: "admin",
          isAdmin: true,
          exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
        }),
      ).toString("base64");

      // Set the token as a cookie in the response
      const response = NextResponse.json({
        success: true,
        message: "Admin login successful",
      });

      response.cookies.set({
        name: "admin-token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
        sameSite: "strict",
      });

      return response;
    }

    // If credentials don't match
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
