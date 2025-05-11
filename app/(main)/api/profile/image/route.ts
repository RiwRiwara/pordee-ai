import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { deleteFromBlob } from "@/lib/blob";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { profileImageUrl, oldImageUrl } = body;

    // Validate input
    if (!profileImageUrl) {
      return NextResponse.json(
        { error: "Profile image URL is required" },
        { status: 400 },
      );
    }

    // Find user and update profile image
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { profileImageUrl },
      { new: true },
    ).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Try to delete old image if it exists
    if (oldImageUrl) {
      try {
        // Delete the old image directly using the full URL
        await deleteFromBlob(oldImageUrl);
        console.log("Successfully deleted old image:", oldImageUrl);
      } catch (deleteError) {
        // Log error but don't fail the request if deletion fails
        console.error("Failed to delete old image:", deleteError);
      }
    }

    return NextResponse.json({
      message: "Profile image updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);

    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 },
    );
  }
}
