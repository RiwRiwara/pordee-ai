/**
 * Utility for tracking user activity in the application
 */

import { useEffect, useState } from 'react';

// Session ID management
const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('pordee_session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}`;
    localStorage.setItem('pordee_session_id', sessionId);
  }
  return sessionId;
};

interface TrackingData {
  startTimeInputDebt?: Date;
  finishTimeInputDebt?: Date;
  startTimeRadar?: Date;
  startTimePlanner?: Date;
  ocrUsed?: boolean;
  incrementEdit?: boolean;
  completedAll?: boolean;
  deviceType?: string;
  sessionId?: string;
}

/**
 * Track user activity by sending data to the tracking API
 */
export const trackActivity = async (data: TrackingData) => {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const response = await fetch('/api/tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        sessionId,
      }),
    });

    if (!response.ok) {
      console.error('Error tracking user activity');
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to track user activity:', error);
  }
};

/**
 * React hook to track user activity in components
 */
export const useTracking = () => {
  const [deviceType, setDeviceType] = useState<string>('unknown');

  // Detect device type on mount
  useEffect(() => {
    const detectDeviceType = () => {
      const ua = navigator.userAgent;
      
      if (/mobile/i.test(ua)) return 'mobile';
      if (/tablet/i.test(ua) || /ipad/i.test(ua)) return 'tablet';
      return 'desktop';
    };

    setDeviceType(detectDeviceType());
  }, []);

  // Tracking functions
  const trackDebtInputStart = () => {
    trackActivity({
      startTimeInputDebt: new Date(),
      deviceType,
    });
  };

  const trackDebtInputFinish = () => {
    trackActivity({
      finishTimeInputDebt: new Date(),
      deviceType,
    });
  };

  const trackRadarView = () => {
    trackActivity({
      startTimeRadar: new Date(),
      deviceType,
    });
  };

  const trackPlannerStart = () => {
    trackActivity({
      startTimePlanner: new Date(),
      deviceType,
    });
  };

  const trackOCRUsage = (used: boolean = true) => {
    trackActivity({
      ocrUsed: used,
      deviceType,
    });
  };

  const trackEdit = () => {
    trackActivity({
      incrementEdit: true,
      deviceType,
    });
  };

  const trackCompletion = (completed: boolean = true) => {
    trackActivity({
      completedAll: completed,
      deviceType,
    });
  };

  return {
    trackDebtInputStart,
    trackDebtInputFinish,
    trackRadarView,
    trackPlannerStart,
    trackOCRUsage,
    trackEdit,
    trackCompletion,
  };
};

/**
 * Get tracking data for analysis
 */
export const getTrackingData = async (sessionId?: string) => {
  try {
    const url = sessionId 
      ? `/api/tracking?sessionId=${encodeURIComponent(sessionId)}`
      : '/api/tracking';
      
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch tracking data');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return { success: false, error };
  }
};
