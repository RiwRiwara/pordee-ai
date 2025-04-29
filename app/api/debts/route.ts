import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";

import connectToDatabase from "@/lib/mongodb";
import Debt from "@/models/Debt";
import { IAttachment } from "@/models/Debt";

// Get all debts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const debts = await Debt.find({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ debts });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 },
    );
  }
}

// Create a new debt
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

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

    // Validate required fields and log what's missing for debugging
    const missingFields = [];

    if (!name) missingFields.push("name");
    if (!debtType) missingFields.push("debtType");
    if (totalAmount === undefined || totalAmount === null)
      missingFields.push("totalAmount");
    if (remainingAmount === undefined || remainingAmount === null)
      missingFields.push("remainingAmount");
    if (interestRate === undefined || interestRate === null)
      missingFields.push("interestRate");
    if (paymentDueDay === undefined || paymentDueDay === null)
      missingFields.push("paymentDueDay");

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields, body);

      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      );
    }

    // Format attachments with uploadedAt date if present
    const formattedAttachments = attachments
      ? attachments.map((attachment: IAttachment) => ({
          ...attachment,
          uploadedAt: new Date(),
        }))
      : undefined;

    // Format and validate data before creating
    const debtData = {
      userId: session.user.id,
      name,
      debtType,
      totalAmount:
        typeof totalAmount === "number"
          ? totalAmount
          : parseFloat(String(totalAmount)),
      remainingAmount:
        typeof remainingAmount === "number"
          ? remainingAmount
          : parseFloat(String(remainingAmount)),
      interestRate:
        typeof interestRate === "number"
          ? interestRate
          : parseFloat(String(interestRate)),
      paymentDueDay:
        typeof paymentDueDay === "number"
          ? paymentDueDay
          : parseInt(String(paymentDueDay)),
      minimumPayment: minimumPayment
        ? typeof minimumPayment === "number"
          ? minimumPayment
          : parseFloat(String(minimumPayment))
        : 0,
      startDate,
      estimatedPayoffDate,
      notes: notes || "",
      attachments: formattedAttachments,
      isActive: true,
    };

    console.log("Creating debt with data:", debtData);

    // Create new debt
    const newDebt = await Debt.create(debtData);

    return NextResponse.json(
      {
        message: "Debt created successfully",
        debt: newDebt,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create debt" },
      { status: 500 },
    );
  }
}
