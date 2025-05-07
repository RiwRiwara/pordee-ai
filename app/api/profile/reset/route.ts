import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import Debt from "@/models/Debt";
import DebtPayment from "@/models/DebtPayment";
import DebtPlan from "@/models/DebtPlan";
import Finance from "@/models/Finance";

/**
 * POST /api/profile/reset
 * Reset user data (debts, debt payments, debt plans, finances)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userId = session.user.id;

    // Start a transaction to ensure all operations succeed or fail together
    const resetPromises = [
      // Delete all user's debts
      Debt.deleteMany({ userId }),

      // Delete all user's debt payments (based on debt IDs)
      DebtPayment.deleteMany({
        debtId: {
          $in: await Debt.find({ userId }).select("_id"),
        },
      }),

      // Delete all user's debt plans
      DebtPlan.deleteMany({ userId }),

      // Delete all user's finance data
      Finance.deleteMany({ userId }),
    ];

    await Promise.all(resetPromises);

    return NextResponse.json({
      success: true,
      message: "User data has been reset successfully",
    });
  } catch (error) {
    console.error("Error resetting user data:", error);

    return NextResponse.json(
      { error: "Failed to reset user data" },
      { status: 500 },
    );
  }
}
