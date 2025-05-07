import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "../auth/[...nextauth]/options";

import SurveyResponse from "@/models/Survey";
import connectToDatabase from "@/lib/mongodb";

// Schema for validating survey data
const surveySchema = z.object({
  appUsabilityRating: z.number().min(1).max(5),
  appUsabilityComment: z.string().optional(),
  debtInputUnderstandingRating: z.number().min(1).max(5),
  debtInputUnderstandingComment: z.string().optional(),
  radarUnderstandingRating: z.number().min(1).max(5),
  radarUnderstandingComment: z.string().optional(),
  debtPlanHelpfulnessRating: z.number().min(1).max(5),
  debtPlanHelpfulnessComment: z.string().optional(),
  additionalFeedback: z.string().optional(),
});

export async function GET() {
  try {
    // Connect to database
    await connectToDatabase();

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Find user's survey
    const survey = await SurveyResponse.findOne({
      userId: session.user.id,
    });

    return NextResponse.json(
      { success: true, data: survey || null },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching survey:", error);

    return NextResponse.json(
      { error: "Failed to fetch survey" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate survey data
    const validatedData = surveySchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid survey data", details: validatedData.error },
        { status: 400 },
      );
    }

    // Check if user already submitted a survey
    const existingSurvey = await SurveyResponse.findOne({
      userId: session.user.id,
    });

    let surveyResponse;

    if (existingSurvey) {
      // Update existing survey
      surveyResponse = await SurveyResponse.findByIdAndUpdate(
        existingSurvey._id,
        {
          ...validatedData.data,
          updatedAt: new Date(),
        },
        { new: true }, // Return the updated document
      );
    } else {
      // Create new survey response
      surveyResponse = await SurveyResponse.create({
        userId: session.user.id,
        ...validatedData.data,
      });
    }

    return NextResponse.json(
      { success: true, data: surveyResponse },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting survey:", error);

    return NextResponse.json(
      { error: "Failed to submit survey" },
      { status: 500 },
    );
  }
}
