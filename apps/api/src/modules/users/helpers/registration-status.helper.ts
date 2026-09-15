import { MembershipStatus } from '../entities/user-organization.entity';

export type RegistrationStatus = 'completed' | 'pending' | 'expired' | 'rejected';

export function calculateRegistrationStatus(
  authId: string | null | undefined,
  createdAt: Date,
  invitationExpirationDays: number = 30,
): RegistrationStatus {
  // If user has completed registration (has authId)
  if (authId) {
    return 'completed';
  }

  // Calculate expiration date
  const createdAtTime = new Date(createdAt).getTime();
  const expirationTime = createdAtTime + invitationExpirationDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Check if invitation has expired
  if (now > expirationTime) {
    return 'expired';
  }

  // Still pending
  return 'pending';
}

/**
 * Registration status derived from the user's membership in a specific
 * organization (not the global user): active -> completed, rejected -> rejected,
 * invited -> expired past the window (from invitedAt) else pending.
 */
export function membershipRegistrationStatus(
  status: MembershipStatus,
  invitedAt: Date | null | undefined,
  invitationExpirationDays: number = 30,
): RegistrationStatus {
  if (status === MembershipStatus.ACTIVE) return 'completed';
  if (status === MembershipStatus.REJECTED) return 'rejected';

  const base = invitedAt ? new Date(invitedAt).getTime() : Date.now();
  const expirationTime = base + invitationExpirationDays * 24 * 60 * 60 * 1000;
  return Date.now() > expirationTime ? 'expired' : 'pending';
}
