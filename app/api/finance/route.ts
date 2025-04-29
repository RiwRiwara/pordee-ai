import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Finance from '@/models/Finance';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

// Get financial data for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Find existing finance record or create default
    let finance = await Finance.findOne({ userId: session.user.id });
    
    if (!finance) {
      // Create a default finance record if none exists
      finance = await Finance.create({
        userId: session.user.id,
        monthlyIncome: 0,
        monthlyExpense: 0,
        selectedPlan: null
      });
    }

    return NextResponse.json({ finance });
  } catch (error) {
    console.error('Error fetching finance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finance data' },
      { status: 500 }
    );
  }
}

// Update or create financial data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { monthlyIncome, monthlyExpense, selectedPlan } = body;

    // Validate input
    if (monthlyIncome === undefined && monthlyExpense === undefined && selectedPlan === undefined) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (monthlyIncome !== undefined) updateData.monthlyIncome = parseFloat(monthlyIncome);
    if (monthlyExpense !== undefined) updateData.monthlyExpense = parseFloat(monthlyExpense);
    if (selectedPlan !== undefined) updateData.selectedPlan = selectedPlan;

    // Update or create finance data
    const finance = await Finance.findOneAndUpdate(
      { userId: session.user.id },
      updateData,
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: 'Finance data updated successfully',
      finance
    });
  } catch (error) {
    console.error('Error updating finance data:', error);
    return NextResponse.json(
      { error: 'Failed to update finance data' },
      { status: 500 }
    );
  }
}
