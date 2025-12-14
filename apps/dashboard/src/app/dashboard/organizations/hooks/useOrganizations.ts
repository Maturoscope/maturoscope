import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Organization } from "../types/organization";

export function useOrganizations() {
  const { t } = useTranslation("ORGANIZATIONS");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendingUserId, setResendingUserId] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/organizations`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t("NOTIFICATIONS.LOAD_FAILED"));
        setOrganizations([]);
        return;
      }

      setOrganizations(data);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError(t("NOTIFICATIONS.LOAD_ERROR"));
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleToggleActive = async (
    organization: Organization,
    nextValue: boolean,
    onSuccess?: (organizationName: string, wasActivated: boolean) => void
  ) => {
    try {
      const response = await fetch(
        `/api/organizations/${encodeURIComponent(organization.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextValue ? 'active' : 'inactive' }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || t("NOTIFICATIONS.UPDATE_FAILED"));
      }

      setOrganizations((prev) =>
        prev.map((item) =>
          item.id === organization.id ? { ...item, isActive: nextValue } : item
        )
      );

      // Call success callback with organization name and action
      if (onSuccess) {
        onSuccess(organization.name, nextValue);
      }
    } catch (err) {
      console.error("Error updating organization:", err);
      setError(t("NOTIFICATIONS.UPDATE_FAILED"));
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleResendInvitation = async (organization: Organization) => {
    if (!organization.userEmail) return;

    setResendingUserId(organization.id);
    try {
      const response = await fetch("/api/organizations/resend-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organization.id,
          email: organization.userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("NOTIFICATIONS.RESEND_FAILED"));
      }

      // Refresh the organizations list to get updated createdAt and registrationStatus
      await fetchOrganizations();

      setError(t("NOTIFICATIONS.INVITATION_RESENT"));
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error resending invitation:", err);
      setError(
        err instanceof Error ? err.message : t("NOTIFICATIONS.RESEND_FAILED")
      );
      setTimeout(() => setError(null), 4000);
    } finally {
      setResendingUserId(null);
    }
  };

  return {
    organizations,
    loading,
    error,
    resendingUserId,
    fetchOrganizations,
    handleToggleActive,
    handleResendInvitation,
  };
}

