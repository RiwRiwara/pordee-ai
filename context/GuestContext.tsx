'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GuestContextType {
  isGuestMode: boolean;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: ReactNode }) {
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Check if guest mode is enabled in localStorage when the component mounts
  useEffect(() => {
    const storedGuestMode = localStorage.getItem('pordee_guest_mode');
    if (storedGuestMode === 'true') {
      setIsGuestMode(true);
    }
  }, []);

  const enterGuestMode = () => {
    setIsGuestMode(true);
    localStorage.setItem('pordee_guest_mode', 'true');
  };

  const exitGuestMode = () => {
    setIsGuestMode(false);
    localStorage.removeItem('pordee_guest_mode');
  };

  return (
    <GuestContext.Provider
      value={{
        isGuestMode,
        enterGuestMode,
        exitGuestMode,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
}
