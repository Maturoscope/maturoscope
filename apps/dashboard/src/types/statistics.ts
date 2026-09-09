// Shared shape of the statistics returned by /statistics/dashboard and
// /statistics/reports. Kept in one place so the overview and reports pages
// (and the chart components) stay in sync.

export type ScaleKey = "TRL" | "MkRL" | "MfRL";

export interface LevelDataPoint {
  level: number;
  TRL: number;
  MkRL: number;
  MfRL: number;
}

export interface ScaleAssessments {
  started: number;
  completed: number;
}

export interface ServiceConsultation {
  serviceId: string;
  name: string;
  count: number;
}

export interface DashboardStatistics {
  analysisCompletionRate: number;
  contactRate: number;
  chartData: LevelDataPoint[];
  assessmentsByScale: Record<ScaleKey, ScaleAssessments>;
  serviceConsultations: ServiceConsultation[];
  rawStatistics: {
    startedAssessments: number;
    completedAssessments: number;
    contactedServices: number;
    usersByCategoryAndLevel: Record<ScaleKey, Record<string, number>>;
  };
}

export const SCALE_COLORS: Record<ScaleKey, string> = {
  TRL: "#C2410C",
  MkRL: "#0D9488",
  MfRL: "#2563EB",
};

export const EMPTY_STATISTICS: DashboardStatistics = {
  analysisCompletionRate: 0,
  contactRate: 0,
  chartData: Array.from({ length: 10 }, (_, level) => ({
    level,
    TRL: 0,
    MkRL: 0,
    MfRL: 0,
  })),
  assessmentsByScale: {
    TRL: { started: 0, completed: 0 },
    MkRL: { started: 0, completed: 0 },
    MfRL: { started: 0, completed: 0 },
  },
  serviceConsultations: [],
  rawStatistics: {
    startedAssessments: 0,
    completedAssessments: 0,
    contactedServices: 0,
    usersByCategoryAndLevel: { TRL: {}, MkRL: {}, MfRL: {} },
  },
};
