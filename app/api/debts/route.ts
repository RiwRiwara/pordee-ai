import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Debt from '@/models/Debt';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

// Get all debts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const debts = await Debt.find({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ debts });
  } catch (error) {
    console.error('Error fetching debts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debts' },
      { status: 500 }
    );
  }
}

// Create a new debt
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      notes
    } = body;

    // Validate required fields
    if (!name || !debtType || !totalAmount || !remainingAmount || !interestRate || !paymentDueDay) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new debt
    const newDebt = await Debt.create({
      userId: session.user.id,
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
      isActive: true
    });

    return NextResponse.json({
      message: 'Debt created successfully',
      debt: newDebt
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating debt:', error);
    return NextResponse.json(
      { error: 'Failed to create debt' },
      { status: 500 }
    );
  }
}
