import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (user.passwordHash !== hashedPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create JWT token
    const token = sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.NEXTAUTH_SECRET || "fallback_secret",
      { expiresIn: "7d" },
    );

    // Return user data and token
    const userData = user.toObject();

    delete userData.passwordHash;

    return NextResponse.json({
      message: "Login successful",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
