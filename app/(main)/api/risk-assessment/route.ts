import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import RiskAssessment from "@/models/RiskAssessment";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    let userId: string;

    // Get request body
    const data = await req.json();

    // Get user ID from session if authenticated, otherwise from request
    if (session?.user?.id) {
      userId = session.user.id;
    } else if (data.userId) {
      userId = data.userId;
    } else {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectToDatabase();

    // Create risk assessment
    const riskAssessment = new RiskAssessment({
      userId,
      riskFactors: data.riskFactors || [],
      assessmentDate: new Date(),
    });

    await riskAssessment.save();

    return NextResponse.json(
      { success: true, riskAssessment },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving risk assessment:", error);

    return NextResponse.json(
      { error: "Failed to save risk assessment" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get risk assessments for user, sorted by date (newest first)
    const riskAssessments = await RiskAssessment.find({ userId })
      .sort({ assessmentDate: -1 })
      .limit(5)
      .exec();

    return NextResponse.json(riskAssessments);
  } catch (error) {
    console.error("Error fetching risk assessments:", error);

    return NextResponse.json(
      { error: "Failed to fetch risk assessments" },
      { status: 500 },
    );
  }
}
