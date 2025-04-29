import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { firstName, lastName, languagePreference, profileImage } = body;

    // Find user and update profile
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        firstName,
        lastName,
        languagePreference,
        profileImageUrl: profileImage, // Map to the correct field name in the User model
      },
      { new: true },
    ).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
