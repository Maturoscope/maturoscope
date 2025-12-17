export type RegistrationStatus = "completed" | "pending" | "expired";

export type Organization = {
  id: string;
  name: string;
  email: string;
  key?: string;
  isActive: boolean;
  createdAt: string;
  registrationStatus: RegistrationStatus;
  userEmail?: string; // Email of the first user created for this organization
};

export type ActiveFilter = "all" | "active" | "inactive";
export type RegistrationFilter = "all" | RegistrationStatus;

export const registrationDotClasses: Record<RegistrationStatus, string> = {
  completed: "bg-[#059669]",
  pending: "bg-[#D97706]",
  expired: "bg-[#737373]",
};

