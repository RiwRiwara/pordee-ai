import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { withAdminAuth } from '@/lib/auth';

// GET - Retrieve all users (admin only)
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    await connectToDatabase();
    
    // Support for search and filters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDir = searchParams.get('sortDir') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build query
    const query: any = {};
    
    // Add search condition
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add role filter
    if (role && ['user', 'admin'].includes(role)) {
      query.role = role;
    }
    
    // Add status filter
    if (status && ['active', 'inactive'].includes(status)) {
      query.isActive = status === 'active';
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Sort direction
    const sortDirection = sortDir === 'asc' ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortDirection;
    
    // Execute query
    const users = await User.find(query)
      .select('-passwordHash') // Exclude sensitive data
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    
    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

// POST - Create a new user (admin only)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { username, email, password, firstName, lastName, role, languagePreference } = body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = await User.create({
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      role: role || 'user',
      languagePreference: languagePreference || 'th',
      isActive: true
    });
    
    // Remove password hash from response
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;
    
    return NextResponse.json({
      message: 'User created successfully',
      user: userResponse
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
});
