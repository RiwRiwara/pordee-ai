import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Debt from '@/models/Debt';
import { withAdminAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET - Retrieve a specific debt by ID (admin only)
export const GET = withAdminAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    
    const debtId = params.id;
    
    // Validate debt ID
    if (!mongoose.Types.ObjectId.isValid(debtId)) {
      return NextResponse.json(
        { error: 'Invalid debt ID format' },
        { status: 400 }
      );
    }
    
    // Find debt
    const debt = await Debt.findById(debtId).populate('userId', 'username email firstName lastName');
    
    if (!debt) {
      return NextResponse.json(
        { error: 'Debt not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ debt });
  } catch (error) {
    console.error('Error fetching debt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debt' },
      { status: 500 }
    );
  }
});

// PUT - Update a specific debt (admin only)
export const PUT = withAdminAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    
    const debtId = params.id;
    
    // Validate debt ID
    if (!mongoose.Types.ObjectId.isValid(debtId)) {
      return NextResponse.json(
        { error: 'Invalid debt ID format' },
        { status: 400 }
      );
    }
    
    // Get debt data
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
      isActive
    } = body;
    
    // Find debt
    const debt = await Debt.findById(debtId);
    
    if (!debt) {
      return NextResponse.json(
        { error: 'Debt not found' },
        { status: 404 }
      );
    }
    
    // Update debt fields
    if (name) debt.name = name;
    if (debtType) debt.debtType = debtType;
    if (totalAmount !== undefined) debt.totalAmount = parseFloat(totalAmount);
    if (remainingAmount !== undefined) debt.remainingAmount = parseFloat(remainingAmount);
    if (interestRate !== undefined) debt.interestRate = parseFloat(interestRate);
    if (paymentDueDay !== undefined) debt.paymentDueDay = parseInt(paymentDueDay);
    if (minimumPayment !== undefined) debt.minimumPayment = parseFloat(minimumPayment);
    if (startDate) debt.startDate = startDate;
    if (estimatedPayoffDate) debt.estimatedPayoffDate = estimatedPayoffDate;
    if (notes !== undefined) debt.notes = notes;
    if (isActive !== undefined) debt.isActive = isActive;
    
    // Save updated debt
    await debt.save();
    
    return NextResponse.json({
      message: 'Debt updated successfully',
      debt
    });
  } catch (error) {
    console.error('Error updating debt:', error);
    return NextResponse.json(
      { error: 'Failed to update debt' },
      { status: 500 }
    );
  }
});

// DELETE - Delete a specific debt (admin only)
export const DELETE = withAdminAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    
    const debtId = params.id;
    
    // Validate debt ID
    if (!mongoose.Types.ObjectId.isValid(debtId)) {
      return NextResponse.json(
        { error: 'Invalid debt ID format' },
        { status: 400 }
      );
    }
    
    // Find and delete debt
    const deletedDebt = await Debt.findByIdAndDelete(debtId);
    
    if (!deletedDebt) {
      return NextResponse.json(
        { error: 'Debt not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Debt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting debt:', error);
    return NextResponse.json(
      { error: 'Failed to delete debt' },
      { status: 500 }
    );
  }
});
