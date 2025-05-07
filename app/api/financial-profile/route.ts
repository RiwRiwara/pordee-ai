import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import FinancialProfile from "@/models/FinancialProfile";
// Helper function to generate anonymous ID
const generateAnonymousId = () => {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Get financial profile data for the authenticated user or anonymous user
export async function GET(request: NextRequest) {
  console.log("Financial profile GET request received at", new Date().toISOString());
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);
    const anonymousId = url.searchParams.get("anonymousId");

    // For anonymous users, check if anonymousId is provided
    if (!session?.user?.id && !anonymousId) {
      return NextResponse.json({ error: "Unauthorized or missing anonymousId" }, { status: 401 });
    }

    await connectToDatabase();

    let query = {};
    if (session?.user?.id) {
      query = { userId: session.user.id };
    } else if (anonymousId) {
      query = { anonymousId };
    }

    // Find existing financial profile record or create default
    let financialProfile = await FinancialProfile.findOne(query);

    if (!financialProfile) {
      // Create a default financial profile record if none exists
      // Create default data with proper typing
      const defaultData: any = {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        currency: "THB",
      };

      if (session?.user?.id) {
        defaultData.userId = session.user.id;
      } else if (anonymousId) {
        defaultData.anonymousId = anonymousId;
      }

      financialProfile = await FinancialProfile.create(defaultData);
    }

    return NextResponse.json({ financialProfile });
  } catch (error) {
    console.error("Error fetching financial profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial profile data" },
      { status: 500 },
    );
  }
}

// Update or create financial profile data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);
    const anonymousId = url.searchParams.get("anonymousId") || generateAnonymousId();

    await connectToDatabase();

    const body = await request.json();
    const { monthlyIncome, monthlyExpenses, currency } = body;

    // Validate input
    if (
      monthlyIncome === undefined &&
      monthlyExpenses === undefined &&
      currency === undefined
    ) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Build update object
    const updateData: any = {};

    if (monthlyIncome !== undefined)
      updateData.monthlyIncome = parseFloat(monthlyIncome);
    if (monthlyExpenses !== undefined)
      updateData.monthlyExpenses = parseFloat(monthlyExpenses);
    if (currency !== undefined) 
      updateData.currency = currency;

    // Set the query based on authentication status
    let query = {};
    if (session?.user?.id) {
      query = { userId: session.user.id };
      updateData.userId = session.user.id;
    } else {
      query = { anonymousId };
      updateData.anonymousId = anonymousId;
    }

    // Update or create financial profile data
    const financialProfile = await FinancialProfile.findOneAndUpdate(
      query,
      updateData,
      { new: true, upsert: true },
    );

    return NextResponse.json({
      message: "Financial profile data updated successfully",
      financialProfile,
      anonymousId: !session?.user?.id ? anonymousId : undefined,
    });
  } catch (error) {
    console.error("Error updating financial profile:", error);
    return NextResponse.json(
      { error: "Failed to update financial profile data" },
      { status: 500 },
    );
  }
}
