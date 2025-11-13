export type RegistrationStatus = "completed" | "pending" | "expired";

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  authId?: string | null;
  isActive: boolean;
  createdAt: string;
  organizationId?: string | null;
  registrationStatus: RegistrationStatus;
};

export type ActiveFilter = "all" | "active" | "inactive";
export type RegistrationFilter = "all" | RegistrationStatus;

export const registrationStatusLabels: Record<RegistrationStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  expired: "Expired",
};

export const registrationDotClasses: Record<RegistrationStatus, string> = {
  completed: "bg-[#059669]",
  pending: "bg-[#D97706]",
  expired: "bg-[#737373]",
};

