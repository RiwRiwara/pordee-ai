import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { username, email, password, firstName, lastName, languagePreference } = body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
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
        { status: 409 }
      );
    }
    
    // Hash the password
    const passwordHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    // Create new user
    const newUser = await User.create({
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      languagePreference: languagePreference || 'th'
    });
    
    // Remove password from response
    const user = newUser.toObject();
    delete user.passwordHash;
    
    return NextResponse.json({ 
      message: 'User registered successfully',
      user 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
