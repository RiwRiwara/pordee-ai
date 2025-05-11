import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "../../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import Debt from "@/models/Debt";
import { IAttachment } from "@/models/Debt";

// Get a specific debt by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid debt ID format" },
        { status: 400 },
      );
    }

    const debt = await Debt.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!debt) {
      return NextResponse.json(
        { error: "Debt not found or not authorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ debt });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch debt" },
      { status: 500 },
    );
  }
}

// Update a debt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();

    const {
      name,
      debtType,
      totalAmount,
      remainingAmount,
      interestRate,
      paymentDueDay,
      minimumPayment,
      startDate,
      estimatedPayoffDate,
      notes,
      attachments,
    } = body;

    if (
      !name ||
      !debtType ||
      !totalAmount ||
      !remainingAmount ||
      !interestRate ||
      !paymentDueDay
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const formattedAttachments = attachments
      ? attachments.map((attachment: IAttachment) => ({
          ...attachment,
          uploadedAt: attachment.uploadedAt || new Date(),
        }))
      : undefined;

    const updatedDebt = await Debt.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        name,
        debtType,
        totalAmount: parseFloat(totalAmount),
        remainingAmount: parseFloat(remainingAmount),
        interestRate: parseFloat(interestRate),
        paymentDueDay: parseInt(paymentDueDay),
        minimumPayment: minimumPayment ? parseFloat(minimumPayment) : undefined,
        startDate,
        estimatedPayoffDate,
        notes,
        attachments: formattedAttachments,
      },
      { new: true, runValidators: true },
    );

    if (!updatedDebt) {
      return NextResponse.json(
        { error: "Debt not found or not authorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Debt updated successfully",
      debt: updatedDebt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update debt" },
      { status: 500 },
    );
  }
}

// Delete a debt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    const deletedDebt = await Debt.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deletedDebt) {
      return NextResponse.json(
        { error: "Debt not found or not authorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Debt deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete debt" },
      { status: 500 },
    );
  }
}
