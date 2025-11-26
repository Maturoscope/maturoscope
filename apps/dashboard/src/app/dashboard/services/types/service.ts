export type ScaleType = 'TRL' | 'MkRL' | 'MfRL';

export interface GapCoverage {
  questionId: string;
  level: number;
  scaleType: ScaleType;
}

export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ServiceScale {
  type: ScaleType;
  levels: number[];
}

export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  url: string;
  mainContactFirstName: string;
  mainContactLastName: string;
  mainContactEmail: string;
  secondaryContactFirstName: string;
  secondaryContactLastName: string;
  secondaryContactEmail: string;
  gapCoverages: GapCoverage[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSummary {
  id: string;
  name: string;
  description: string;
  url: string;
  mainContact: Contact;
  secondaryContact: Contact;
  scales: ServiceScale[];
}

export interface CreateServicePayload {
  name: string;
  description: string;
  url: string;
  mainContactFirstName: string;
  mainContactLastName: string;
  mainContactEmail: string;
  secondaryContactFirstName: string;
  secondaryContactLastName: string;
  secondaryContactEmail: string;
  gapCoverages: GapCoverage[];
}

export type UpdateServicePayload = Partial<CreateServicePayload>;

// Helper function to get badge color based on levels
export function getBadgeColor(levels: number[]): 'red' | 'yellow' | 'green' {
  const minLevel = Math.min(...levels);
  const maxLevel = Math.max(...levels);
  
  // If contains 1-3, show red
  if (minLevel >= 1 && minLevel <= 3) {
    return 'red';
  }
  // If contains 4-6, show yellow
  if (minLevel >= 4 && minLevel <= 6) {
    return 'yellow';
  }
  // If contains 7-9, show green
  return 'green';
}

// Helper to format contact name
export function formatContactName(contact: Contact): string {
  return `${contact.firstName} ${contact.lastName}`;
}

