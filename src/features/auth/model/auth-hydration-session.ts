import {
  AUTH_SESSION_STATES,
  type AuthSessionState,
} from '@/types/auth/domain';
import type { AuthHydrationSession } from './auth-hydration-context';

export const createAuthHydrationSession = ({
  accessToken,
  sessionState,
}: {
  accessToken?: string;
  sessionState: AuthSessionState;
}): AuthHydrationSession => ({
  accessToken:
    sessionState === AUTH_SESSION_STATES.ANONYMOUS ? undefined : accessToken,
});
