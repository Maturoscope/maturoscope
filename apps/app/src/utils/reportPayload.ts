import { Locale } from "@/dictionaries/dictionaries"
import { StageId, QuestionData } from "@/components/custom/FormPage/Form/Form"
import type { DevelopmentPhase, Gap, LocalizedText } from "@/actions/organization"
import { ReportPayload } from "@/actions/report"
import type { RiskData } from "@/actions/questions"

// ─── Storage types ────────────────────────────────────────────────────────────

export interface FormStorage {
  [stageId: string]: {
    scale: string
    questions: Record<string, string>
    comments: Record<string, string>
  }
}

export type LevelStorage = Partial<Record<StageId, number>>
export type PhasesStorage = Partial<Record<StageId, DevelopmentPhase>>
export type GapsStorage = Partial<Record<StageId, Gap[]>>
export type RisksStorage = Partial<Record<StageId, RiskData>>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocalizedText = (value: LocalizedText | undefined, lang: Locale): string => {
  if (!value) return ""
  return value[lang] ?? value.en ?? value.fr ?? ""
}

// ─── Scale payload builder ────────────────────────────────────────────────────

export const buildScalePayload = (
  stageId: StageId,
  lang: Locale,
  questionsData: { id: StageId; name: string; questions: QuestionData[] }[],
  formData: FormStorage,
  levelData: LevelStorage,
  phasesData: PhasesStorage,
  gapsData: GapsStorage,
  risksData: RisksStorage | null
) => {
  const stageQuestions = questionsData.find((s) => s.id === stageId)?.questions || []
  const stageForm = formData[stageId]
  const level = levelData[stageId] ?? 0
  const phase = phasesData[stageId]
  const gaps = gapsData[stageId] ?? []
  const risk = risksData?.[stageId]

  const answers = stageQuestions.map((q) => {
    const answerId = stageForm?.questions?.[q.id] ?? ""
    const comment = stageForm?.comments?.[q.id] ?? ""
    const answerOption = q.options.find((opt) => opt.id === answerId)
    return {
      question: q.title,
      answer: answerOption?.title ?? "",
      comment,
    }
  })

  const gapsPayload = gaps.map((gap) => ({
    gapDescription: getLocalizedText(gap.gapDescription as LocalizedText | undefined, lang),
    hasServices: gap.hasServices,
    recommendedServices: gap.recommendedServices.map((service) => ({
      name: getLocalizedText(service.name as LocalizedText | undefined, lang),
      description: getLocalizedText(service.description as LocalizedText | undefined, lang),
      ...(service.url && { url: service.url }),
    })),
  }))

  return {
    level,
    phase: phase?.phase ?? 0,
    phaseName: phase?.phaseName?.[lang] ?? "",
    phaseGoal: phase?.focusGoal?.[lang] ?? "",
    strategicFocus: (risk?.strategicFocus as LocalizedText)?.[lang] ?? "",
    primaryRisk: (risk?.primaryRisk as LocalizedText)?.[lang] ?? "",
    isLowest: risk?.isLowest ?? false,
    gaps: gapsPayload,
    answers,
  }
}

// ─── Full report payload builder ──────────────────────────────────────────────

/**
 * Builds the report payload entirely from localStorage.
 * All data (form, levels, phases, gaps, risks, signature) must already be
 * persisted before calling this function. This avoids any server action or
 * network calls which can hang during page transitions.
 */
export const buildReportPayload = async (
  lang: Locale,
  questionsData: { id: StageId; name: string; questions: QuestionData[] }[]
): Promise<ReportPayload> => {
  const formData: FormStorage = JSON.parse(localStorage.getItem("form") || "{}")
  const levelData: LevelStorage = JSON.parse(localStorage.getItem("level") || "{}")
  const phasesData: PhasesStorage = JSON.parse(localStorage.getItem("phases") || "{}")
  const gapsData: GapsStorage = JSON.parse(localStorage.getItem("gaps") || "{}")

  // Read risks from localStorage (pre-saved by ProgressContext after last checkpoint)
  let risksData: RisksStorage | null = null
  try {
    const storedRisks = localStorage.getItem("risks")
    if (storedRisks) {
      risksData = JSON.parse(storedRisks)
    }
  } catch {
    // ignore
  }

  const storedCompletedOn = localStorage.getItem("completedOn")
  const completedOnDate = storedCompletedOn ? new Date(storedCompletedOn) : new Date()
  const completedOn = completedOnDate.toLocaleDateString(
    lang === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  )

  const projectName = localStorage.getItem("projectName") || undefined

  // Signature: read from localStorage cache (pre-saved by Header component)
  const SIGNATURE_STORAGE_KEY = "organization-signature"
  let signatureUrl: string | undefined
  try {
    const stored = localStorage.getItem(SIGNATURE_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as { organizationKey: string; url: string }
      if (parsed.url) {
        signatureUrl = parsed.url
      }
    }
  } catch {
    // ignore
  }

  return {
    completedOn,
    projectName,
    signature: signatureUrl,
    trl: buildScalePayload("trl", lang, questionsData, formData, levelData, phasesData, gapsData, risksData),
    mkrl: buildScalePayload("mkrl", lang, questionsData, formData, levelData, phasesData, gapsData, risksData),
    mfrl: buildScalePayload("mfrl", lang, questionsData, formData, levelData, phasesData, gapsData, risksData),
  }
}
