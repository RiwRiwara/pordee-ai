import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "../../../auth/[...nextauth]/options";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

// Get user's context
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (await params).id;
    const currentUserId = session.user.id;

    // Only allow users to access their own context
    if (userId !== currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized to access this user's context" },
        { status: 403 }
      );
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the user
    const user = await User.findById(userId).select("context");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ context: user.context || "" });
  } catch (error) {
    console.error("Error fetching user context:", error);
    return NextResponse.json(
      { error: "Failed to fetch user context" },
      { status: 500 }
    );
  }
}

// Update user's context
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (await params).id;
    const currentUserId = session.user.id;

    // Only allow users to update their own context
    if (userId !== currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized to update this user's context" },
        { status: 403 }
      );
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Parse request body
    const { context } = await request.json();

    if (typeof context !== "string") {
      return NextResponse.json(
        { error: "Context must be a string" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Update the user's context
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { context },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User context updated successfully",
    });
  } catch (error) {
    console.error("Error updating user context:", error);
    return NextResponse.json(
      { error: "Failed to update user context" },
      { status: 500 }
    );
  }
}
