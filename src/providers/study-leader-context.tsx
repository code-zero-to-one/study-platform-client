'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { Leader } from '@/features/study/group/api/group-study-types';

interface StudyLeaderContextValue {
  leaderInfo: Leader | null;
  leaderId: number | undefined;
  isLeader: boolean;
}

const StudyLeaderContext = createContext<StudyLeaderContextValue | null>(null);

interface StudyLeaderProviderProps {
  children: ReactNode;
  leaderInfo: Leader | null;
  memberId?: number;
}

export function StudyLeaderProvider({
  children,
  leaderInfo,
  memberId,
}: StudyLeaderProviderProps) {
  const value = useMemo(() => {
    const leaderId = leaderInfo?.memberId;
    const isLeader = leaderId !== undefined && leaderId === memberId;

    return {
      leaderInfo,
      leaderId,
      isLeader,
    };
  }, [leaderInfo, memberId]);

  return (
    <StudyLeaderContext.Provider value={value}>
      {children}
    </StudyLeaderContext.Provider>
  );
}

export function useStudyLeader(): StudyLeaderContextValue {
  const context = useContext(StudyLeaderContext);

  if (context === null) {
    throw new Error('useStudyLeader must be used within a StudyLeaderProvider');
  }

  return context;
}

export function useIsLeader(): boolean {
  const { isLeader } = useStudyLeader();

  return isLeader;
}

export function useLeaderInfo(): Leader | null {
  const { leaderInfo } = useStudyLeader();

  return leaderInfo;
}
