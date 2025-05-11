import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "../../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import DebtPlan from "@/models/DebtPlan";

// Get a specific debt plan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = (await params).id;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return NextResponse.json(
        { error: "Invalid debt plan ID format" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the debt plan
    const plan = await DebtPlan.findOne({
      _id: planId,
      userId: userId,
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Debt plan not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching debt plan:", error);

    return NextResponse.json(
      { error: "Failed to fetch debt plan" },
      { status: 500 },
    );
  }
}

// Update a debt plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = (await params).id;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return NextResponse.json(
        { error: "Invalid debt plan ID format" },
        { status: 400 },
      );
    }

    // Parse request body
    const updateData = await request.json();

    // Connect to database
    await connectToDatabase();

    // Find and update the debt plan
    const updatedPlan = await DebtPlan.findOneAndUpdate(
      { _id: planId, userId: userId },
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updatedPlan) {
      return NextResponse.json(
        {
          error:
            "Debt plan not found or you do not have permission to update it",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Debt plan updated successfully",
      plan: updatedPlan,
    });
  } catch (error) {
    console.error("Error updating debt plan:", error);

    return NextResponse.json(
      {
        error: "Failed to update debt plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Delete a debt plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = (await params).id;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return NextResponse.json(
        { error: "Invalid debt plan ID format" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find and delete the debt plan (or mark as inactive)
    const result = await DebtPlan.findOneAndUpdate(
      { _id: planId, userId: userId },
      { isActive: false, updatedAt: new Date() },
      { new: true },
    );

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Debt plan not found or you do not have permission to delete it",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Debt plan deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting debt plan:", error);

    return NextResponse.json(
      { error: "Failed to delete debt plan" },
      { status: 500 },
    );
  }
}
