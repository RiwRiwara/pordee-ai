import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import DebtPlan from "@/models/DebtPlan";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Parse request body
    const planData = await req.json();

    // Connect to database
    await connectToDatabase();

    // Add user ID to plan data
    const debtPlanWithUser = {
      ...planData,
      userId,
    };

    // Insert plan into database using Mongoose model
    const newDebtPlan = new DebtPlan(debtPlanWithUser);

    await newDebtPlan.save();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Debt plan saved successfully",
        plan: newDebtPlan,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving debt plan:", error);

    return NextResponse.json(
      {
        error: "Failed to save debt plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Connect to database
    await connectToDatabase();

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive") === "true";

    // Build query
    const query: any = { userId };

    if (searchParams.has("isActive")) {
      query.isActive = isActive;
    }

    // Fetch plans from database using Mongoose model
    const plans = await DebtPlan.find(query).sort({ updatedAt: -1 }).exec();

    // Return plans
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching debt plans:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch debt plans",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
