import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongodb";
import Debt from "@/models/Debt";
import { withAdminAuth } from "@/lib/auth";

// GET - Retrieve all debts (admin only)
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    await connectToDatabase();

    // Support for search and filters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const debtType = searchParams.get("debtType");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDir = searchParams.get("sortDir") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = {};

    // Add filters
    if (userId) query.userId = userId;
    if (debtType) query.debtType = debtType;

    // Amount range
    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.totalAmount.$lte = parseFloat(maxAmount);
    }

    // Active status
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Sort direction
    const sortDirection = sortDir === "asc" ? 1 : -1;
    const sortOptions: any = {};

    sortOptions[sortBy] = sortDirection;

    // Execute query
    const debts = await Debt.find(query)
      .populate("userId", "username email firstName lastName")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalDebts = await Debt.countDocuments(query);

    return NextResponse.json({
      debts,
      pagination: {
        total: totalDebts,
        page,
        limit,
        totalPages: Math.ceil(totalDebts / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching debts:", error);

    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 },
    );
  }
});

// POST - Create a new debt as admin (for any user)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      userId,
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
    } = body;

    // Validate required fields
    if (
      !userId ||
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

    // Create new debt
    const newDebt = await Debt.create({
      userId,
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
      isActive: true,
    });

    return NextResponse.json(
      {
        message: "Debt created successfully",
        debt: newDebt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating debt:", error);

    return NextResponse.json(
      { error: "Failed to create debt" },
      { status: 500 },
    );
  }
});
