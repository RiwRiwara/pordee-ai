import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import DebtPlan from "@/models/DebtPlan";

export async function POST(req: NextRequest) {
  try {
    console.log("Received debt plan POST request");

    // Check authentication
    const session = await getServerSession(authOptions);
    let userId: string;
    let initialPlanData: any = null;

    // Get user ID from session if authenticated
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("Authenticated user ID:", userId);
    } else {
      // For anonymous users, generate a temporary ID or use one from request
      initialPlanData = await req.json();
      if (initialPlanData.anonymousId) {
        userId = initialPlanData.anonymousId;
        console.log("Using anonymous ID from request:", userId);
      } else {
        // Generate a temporary ID for anonymous users
        userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.log("Generated anonymous ID:", userId);
      }
    }

    // Parse request body (re-parse if we already parsed it above)
    const planData = initialPlanData || (await req.json());

    console.log("Plan data received:", JSON.stringify(planData, null, 2));

    // Connect to database
    await connectToDatabase();

    // Add user ID to plan data
    const debtPlanWithUser = {
      ...planData,
      userId,
    };

    // Remove any undefined or null ID field if present
    if (debtPlanWithUser.id === undefined || debtPlanWithUser.id === null) {
      delete debtPlanWithUser.id;
    }

    console.log(
      "Saving debt plan with data:",
      JSON.stringify(debtPlanWithUser, null, 2),
    );

    // Insert plan into database using Mongoose model
    const newDebtPlan = new DebtPlan(debtPlanWithUser);

    await newDebtPlan.save();
    console.log("Debt plan saved successfully with ID:", newDebtPlan._id);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Debt plan saved successfully",
        plan: newDebtPlan,
        _id: newDebtPlan._id,
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
    console.log("Received debt plan GET request");

    // Check authentication
    const session = await getServerSession(authOptions);
    let userId;

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const anonymousId = searchParams.get("anonymousId");

    // Determine user ID source (authenticated or anonymous)
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("Fetching plans for authenticated user:", userId);
    } else if (anonymousId) {
      userId = anonymousId;
      console.log("Fetching plans for anonymous user:", userId);
    } else {
      console.log("No user ID available for fetching plans");

      return NextResponse.json([], { status: 200 }); // Return empty array for users with no ID
    }

    // Connect to database
    await connectToDatabase();

    const isActive = searchParams.get("isActive") === "true";

    // Build query
    const query: any = { userId };

    if (searchParams.has("isActive")) {
      query.isActive = isActive;
    }

    console.log("Querying debt plans with:", query);

    // Fetch plans from database using Mongoose model
    const plans = await DebtPlan.find(query).sort({ updatedAt: -1 }).exec();

    console.log(`Found ${plans.length} debt plans`);

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

// Update an existing debt plan
export async function PUT(req: NextRequest) {
  try {
    console.log("Received debt plan PUT request for updating");

    // Check authentication
    const session = await getServerSession(authOptions);
    let userId: string;

    // Parse request body
    const planData = await req.json();
    console.log("Update plan data received:", JSON.stringify(planData, null, 2));

    // Get user ID from session if authenticated
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("Authenticated user ID:", userId);
    } else if (planData.anonymousId) {
      userId = planData.anonymousId;
      console.log("Using anonymous ID from request:", userId);
    } else {
      return NextResponse.json(
        { error: "Unauthorized or missing anonymousId" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Ensure we have a plan ID to update
    if (!planData._id && !planData.id) {
      return NextResponse.json(
        { error: "Missing plan ID for update" },
        { status: 400 }
      );
    }

    const planId = planData._id || planData.id;
    delete planData._id; // Remove _id to avoid MongoDB error
    delete planData.id;  // Remove id to avoid duplication

    // Check if there's a plan with this ID and userId
    const existingPlan = await DebtPlan.findOne({
      _id: planId,
      userId: userId
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plan not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare and validate plan data for MongoDB update
    // Clone the data to avoid modifying the original
    const cleanPlanData = { ...planData };
    
    // Ensure debtItems is properly formatted for Mongoose
    if (cleanPlanData.debtItems && Array.isArray(cleanPlanData.debtItems)) {
      // Ensure each debt item is a proper object with the required fields
      cleanPlanData.debtItems = cleanPlanData.debtItems.map((item: string | any) => {
        // If a debt item is just a string ID, convert it to a proper object
        if (typeof item === 'string') {
          return {
            debtId: item,
            name: 'Unknown Debt',
            debtType: 'สินเชื่อ',
            originalAmount: 0,
            remainingAmount: 0,
            interestRate: 0,
            minimumPayment: 0,
            paymentOrder: 1
          };
        }
        // Otherwise, ensure it has all required fields
        return item;
      });
    }
    
    // Add user ID to plan data
    const debtPlanWithUser = {
      ...cleanPlanData,
      userId,
    };

    console.log(
      "Updating debt plan with data:",
      JSON.stringify(debtPlanWithUser, null, 2),
    );

    // Update plan in database using Mongoose model
    // Use runValidators to ensure schema validation during update
    const updatedPlan = await DebtPlan.findByIdAndUpdate(
      planId,
      debtPlanWithUser,
      { new: true, runValidators: true }
    );

    console.log("Debt plan updated successfully with ID:", updatedPlan._id);

    // Calculate and update the debt-to-income ratio
    // For risk assessment based on the formula: (all minimum debt / all income before expense and tax) * 100
    if (planData.debtItems && planData.debtItems.length > 0) {
      // This would typically be calculated based on the financial profile data
      // But we'll leave this to be handled by risk-assessment API
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Debt plan updated successfully",
      plan: updatedPlan,
      _id: updatedPlan._id,
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
