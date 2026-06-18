'use client';

import React, { createContext, use, useMemo } from 'react';

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
  const value = useMemo(() => ({ initialSession }), [initialSession]);

  return (
    <AuthHydrationContext.Provider value={value}>
      {children}
    </AuthHydrationContext.Provider>
  );
}

export function useAuthHydration() {
  return use(AuthHydrationContext);
}
