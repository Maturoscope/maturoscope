import { useState, useCallback, useEffect } from "react";
import { Member } from "../types/member";

export function useMembers(organizationId?: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendingUserId, setResendingUserId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/users?organizationId=${organizationId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load members.");
        setMembers([]);
        return;
      }

      setMembers(data);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Unexpected error fetching members.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleToggleActive = async (member: Member, nextValue: boolean) => {
    try {
      const response = await fetch(
        `/api/user/${encodeURIComponent(member.email)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: nextValue }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update user.");
      }

      setMembers((prev) =>
        prev.map((item) =>
          item.email === member.email ? { ...item, isActive: nextValue } : item
        )
      );
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update member status.");
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleResendInvitation = async (member: Member) => {
    if (!organizationId) return;

    setResendingUserId(member.id);
    try {
      const response = await fetch("/api/users/resend-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          organizationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend invitation.");
      }

      // Refresh the members list to get updated createdAt and registrationStatus
      await fetchMembers();

      setError("Invitation resent successfully!");
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error resending invitation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to resend invitation."
      );
      setTimeout(() => setError(null), 4000);
    } finally {
      setResendingUserId(null);
    }
  };

  return {
    members,
    loading,
    error,
    resendingUserId,
    fetchMembers,
    handleToggleActive,
    handleResendInvitation,
  };
}

