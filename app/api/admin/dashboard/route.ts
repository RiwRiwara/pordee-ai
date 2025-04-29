import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Debt from '@/models/Debt';
import { withAdminAuth } from '@/lib/auth';

// GET - Retrieve dashboard statistics (admin only)
export const GET = withAdminAuth(async (request: NextRequest) => {
  let dbConnection;
  
  try {
    // Establish database connection with timeout handling
    try {
      dbConnection = await Promise.race([
        connectToDatabase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 5000)
        )
      ]);
    } catch (connError) {
      console.error('Database connection failed:', connError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' },
        { status: 503 } // Service Unavailable
      );
    }
    
    // Parallel queries for better performance
    const [userStats, debtStats] = await Promise.all([
      // User statistics
      getUserStatistics(),
      // Debt statistics
      getDebtStatistics()
    ]);
    
    return NextResponse.json({
      ...userStats,
      ...debtStats
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
});

// Helper function to get user statistics with error handling
async function getUserStatistics() {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const [totalUsers, activeUsers, recentRegistrations] = await Promise.all([
      User.countDocuments().exec(), // Using exec() instead of maxTimeMS for better compatibility
      User.countDocuments({ isActive: true }).exec(),
      User.countDocuments({ createdAt: { $gte: oneWeekAgo } }).exec()
    ]);
    
    return { totalUsers, activeUsers, recentRegistrations };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    // Return default values on error instead of failing
    return { totalUsers: 0, activeUsers: 0, recentRegistrations: 0 };
  }
}

// Helper function to get debt statistics with error handling
async function getDebtStatistics() {
  try {
    const totalDebts = await Debt.countDocuments().exec();
    
    // Set timeout option for the aggregation pipeline
    const aggregateOptions = { maxTimeMS: 3000 };
    
    const debtAmountResult = await Debt.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ], aggregateOptions); // Pass options as second parameter
    
    const totalDebtAmount = debtAmountResult.length > 0 ? debtAmountResult[0].totalAmount : 0;
    const averageDebtAmount = debtAmountResult.length > 0 && debtAmountResult[0].count > 0
      ? totalDebtAmount / debtAmountResult[0].count
      : 0;
    
    return { totalDebts, totalDebtAmount, averageDebtAmount };
  } catch (error) {
    console.error('Error getting debt statistics:', error);
    // Return default values on error instead of failing
    return { totalDebts: 0, totalDebtAmount: 0, averageDebtAmount: 0 };
  }
}
