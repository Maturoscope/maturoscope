export type RegistrationStatus = 'completed' | 'pending' | 'expired';

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

