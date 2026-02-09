'use client';

import React, { createContext, useContext } from 'react';

interface AuthHydrationContextValue {
  initialAccessToken?: string;
}

const AuthHydrationContext = createContext<AuthHydrationContextValue>({});

export function AuthHydrationProvider({
  initialAccessToken,
  children,
}: {
  initialAccessToken?: string;
  children: React.ReactNode;
}) {
  return (
    <AuthHydrationContext.Provider value={{ initialAccessToken }}>
      {children}
    </AuthHydrationContext.Provider>
  );
}

export function useAuthHydration() {
  return useContext(AuthHydrationContext);
}
