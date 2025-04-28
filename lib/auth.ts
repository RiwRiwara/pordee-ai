import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function verifyToken(request: NextRequest): Promise<string | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return null;
    }
    
    // Verify the token
    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback_secret') as { userId: string };
    
    if (!decoded || !decoded.userId) {
      return null;
    }
    
    return decoded.userId;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
