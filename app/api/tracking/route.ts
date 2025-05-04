import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import UserTracking from "@/models/UserTracking";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";

// Initialize or update user tracking data
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    const data = await req.json();
    
    // Generate a userId even for anonymous users
    let userId = "anonymous";
    let isAnonymous = true;
    
    // Try multiple ways to get a valid userId
    if (session?.user?.id) {
      // Use authenticated user ID if available
      userId = session.user.id;
      isAnonymous = false;
    } else if (data.anonymousId && typeof data.anonymousId === 'string' && data.anonymousId.length > 0) {
      // Use provided anonymousId for guest users
      userId = data.anonymousId;
    } else if (data.sessionId && typeof data.sessionId === 'string' && data.sessionId.length > 0) {
      // If no anonymousId, use sessionId as userId (still anonymous)
      userId = `anon-${data.sessionId}`;
    } else {
      // Final fallback - use a timestamp-based ID
      userId = `anon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    // Generate session ID if not provided
    const sessionId = data.sessionId || `${userId}-${Date.now()}`;

    // Find existing tracking record or create a new one
    let tracking = await UserTracking.findOne({
      userId,
      sessionId,
      ...(isAnonymous ? { isAnonymous: true } : {}),
    });

    if (!tracking) {
      tracking = new UserTracking({
        userId,
        sessionId,
        deviceType: data.deviceType || detectDeviceType(req),
        isAnonymous: isAnonymous,
      });
    }

    // Update tracking fields if provided in request
    if (data.startTimeInputDebt) tracking.startTimeInputDebt = new Date(data.startTimeInputDebt);
    if (data.finishTimeInputDebt) tracking.finishTimeInputDebt = new Date(data.finishTimeInputDebt);
    if (data.startTimeRadar) tracking.startTimeRadar = new Date(data.startTimeRadar);
    if (data.startTimePlanner) tracking.startTimePlanner = new Date(data.startTimePlanner);
    if (data.ocrUsed !== undefined) tracking.ocrUsed = data.ocrUsed;
    if (data.completedAll !== undefined) tracking.completedAll = data.completedAll;

    // Increment edit count if specified
    if (data.incrementEdit) {
      tracking.editCount = (tracking.editCount || 0) + 1;
    }

    await tracking.save();

    return NextResponse.json({ success: true, tracking });
  } catch (error) {
    console.error("Error tracking user activity:", error);
    return NextResponse.json(
      { error: "Failed to track user activity" },
      { status: 500 }
    );
  }
}

// Get tracking data for current user
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    const query: any = { userId };
    if (sessionId) query.sessionId = sessionId;

    const tracking = await UserTracking.find(query)
      .sort({ createdAt: -1 })
      .limit(sessionId ? 1 : 10);

    return NextResponse.json({ success: true, tracking });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking data" },
      { status: 500 }
    );
  }
}

// Helper function to detect device type from request
function detectDeviceType(req: NextRequest): string {
  const userAgent = req.headers.get("user-agent") || "";

  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet/i.test(userAgent)) return "tablet";
  if (/ipad/i.test(userAgent)) return "tablet";

  return "desktop";
}
