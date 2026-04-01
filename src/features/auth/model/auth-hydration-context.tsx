'use client';

import React, { createContext, useContext } from 'react';

export interface AuthHydrationSession {
  accessToken?: string;
}

interface AuthHydrationContextValue {
  initialSession?: AuthHydrationSession;
}

const AuthHydrationContext = createContext<AuthHydrationContextValue>({});

export function AuthHydrationProvider({
  initialSession,
  children,
}: {
  initialSession?: AuthHydrationSession;
  children: React.ReactNode;
}) {
  return (
    <AuthHydrationContext.Provider value={{ initialSession }}>
      {children}
    </AuthHydrationContext.Provider>
  );
}

export function useAuthHydration() {
  return useContext(AuthHydrationContext);
}
