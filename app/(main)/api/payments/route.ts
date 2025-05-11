import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import DebtPayment from "@/models/DebtPayment";
import Debt from "@/models/Debt";

// GET /api/payments - Get all payments for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get all debt IDs for the current user
    const userDebts = await Debt.find({ userId: session.user.id }).select(
      "_id",
    );
    const userDebtIds = userDebts.map((debt) => debt._id);

    // Get all payments for those debts
    const payments = await DebtPayment.find({
      debtId: { $in: userDebtIds },
    }).sort({ paymentDate: -1 });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);

    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 },
    );
  }
}

// POST /api/payments - Create a new payment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { debtId, amount, paymentDate, paymentType, notes } =
      await req.json();

    if (!debtId || !amount || !paymentDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Verify the debt belongs to the user
    const debt = await Debt.findOne({
      _id: debtId,
      userId: session.user.id,
    });

    if (!debt) {
      return NextResponse.json(
        { error: "Debt not found or does not belong to user" },
        { status: 404 },
      );
    }

    // Create the payment
    const payment = new DebtPayment({
      debtId,
      amount,
      paymentDate: new Date(paymentDate),
      paymentType: paymentType || "regular",
      notes,
    });

    await payment.save();

    // Update the debt's remaining amount
    const newRemainingAmount = Math.max(0, debt.remainingAmount - amount);

    debt.remainingAmount = newRemainingAmount;
    await debt.save();

    return NextResponse.json({ payment, success: true });
  } catch (error) {
    console.error("Error creating payment:", error);

    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 },
    );
  }
}
