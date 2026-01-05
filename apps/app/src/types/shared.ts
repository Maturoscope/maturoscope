/**
 * Shared types across the application
 * These types are used in both API Routes and client components
 */

export type ScaleType = "TRL" | "MkRL" | "MfRL"
export type StageId = "trl" | "mkrl" | "mfrl"

export type FontTheme = "geist" | "open-sans" | "inter" | "poppins"

export type AccentTheme =
  | "default"
  | "orange"
  | "blue"
  | "green"
  | "pink"
  | "violet"

export interface LocalizedText {
  en: string
  fr: string
}

export interface DevelopmentPhase {
  phase: number
  phaseName: LocalizedText
  focusGoal: LocalizedText
  scaleRange: string
}

export interface RecommendedService {
  id: string
  name: LocalizedText
  description: LocalizedText
}

export interface Gap {
  questionId: string
  level: number
  gapDescription: LocalizedText
  hasServices: boolean
  recommendedServices: RecommendedService[]
}

export interface AssessmentResponse {
  scale: ScaleType
  readinessLevel: number
  developmentPhase: DevelopmentPhase
  gaps: Gap[]
}

export interface RiskData {
  readinessLevel: number
  phase: number
  isLowest: boolean
  strategicFocus?: LocalizedText
  primaryRisk?: LocalizedText
}

export type RisksRecord = Record<StageId, RiskData>

// Report types
export interface AnswerPayload {
  question: string
  answer: string
  comment: string
}

export interface RecommendedServicePayload {
  name: string
  description: string
}

export interface GapPayload {
  gapDescription: string
  hasServices: boolean
  recommendedServices: RecommendedServicePayload[]
}

export interface ScalePayload {
  level: number
  phase: number
  phaseName: string
  phaseGoal: string
  strategicFocus: string
  primaryRisk: string
  isLowest: boolean
  gaps: GapPayload[]
  answers: AnswerPayload[]
}

export interface ReportPayload {
  completedOn: string
  projectName?: string
  signature?: string
  trl: ScalePayload
  mkrl: ScalePayload
  mfrl: ScalePayload
}

// Contact types
export interface SelectedGap {
  questionId: string
  level: number
  recommendedServices: string[]
}

export interface ContactInformation {
  organization?: string
  country?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  additionalInformation?: string
}

// Questions types
export interface QuestionData {
  id: string
  title: string
  options: Array<{
    id: string
    title: string
  }>
}

export interface StageData {
  id: StageId
  name: string
  questions: QuestionData[]
}

