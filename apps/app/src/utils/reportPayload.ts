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

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

type ScaleAbbreviation = "TRL" | "MkRL" | "MfRL"

/**
 * Fetches risk analysis directly from the API (client-side).
 * Avoids using the server action which can hang during page transitions.
 */
const fetchRisksFromClient = async (
  levels: Record<StageId, number>,
  phases: Record<StageId, number>
): Promise<RisksStorage> => {
  const organizationKey = getCookie("organization-key")
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/readiness-assessment/analyze-risk${organizationKey ? `?organizationKey=${organizationKey}` : ""}`

  const scales = [
    { scale: "TRL" as ScaleAbbreviation, readinessLevel: levels.trl, phase: phases.trl },
    { scale: "MkRL" as ScaleAbbreviation, readinessLevel: levels.mkrl, phase: phases.mkrl },
    { scale: "MfRL" as ScaleAbbreviation, readinessLevel: levels.mfrl, phase: phases.mfrl },
  ]

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scales }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch risks: ${response.statusText}`)
  }

  const data = await response.json()
  const scaleToStageId: Record<ScaleAbbreviation, StageId> = { TRL: "trl", MkRL: "mkrl", MfRL: "mfrl" }
  const risksRecord: RisksStorage = {}

  data.risks.forEach((risk: { scale: ScaleAbbreviation; readinessLevel: number; phase: number; isLowest: boolean; strategicFocus?: unknown; primaryRisk?: unknown }) => {
    const stageId = scaleToStageId[risk.scale]
    risksRecord[stageId] = {
      readinessLevel: risk.readinessLevel,
      phase: risk.phase,
      isLowest: risk.isLowest,
      strategicFocus: risk.strategicFocus as RiskData["strategicFocus"],
      primaryRisk: risk.primaryRisk as RiskData["primaryRisk"],
    }
  })

  return risksRecord
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

export const buildReportPayload = async (
  lang: Locale,
  questionsData: { id: StageId; name: string; questions: QuestionData[] }[]
): Promise<ReportPayload> => {
  const formData: FormStorage = JSON.parse(localStorage.getItem("form") || "{}")
  const levelData: LevelStorage = JSON.parse(localStorage.getItem("level") || "{}")
  const phasesData: PhasesStorage = JSON.parse(localStorage.getItem("phases") || "{}")
  const gapsData: GapsStorage = JSON.parse(localStorage.getItem("gaps") || "{}")

  const hasAllLevels =
    levelData.trl !== undefined &&
    levelData.mkrl !== undefined &&
    levelData.mfrl !== undefined
  const hasAllPhases =
    phasesData.trl?.phase !== undefined &&
    phasesData.mkrl?.phase !== undefined &&
    phasesData.mfrl?.phase !== undefined

  let risksData: RisksStorage | null = null
  if (hasAllLevels && hasAllPhases) {
    risksData = await fetchRisksFromClient(
      {
        trl: levelData.trl as number,
        mkrl: levelData.mkrl as number,
        mfrl: levelData.mfrl as number,
      },
      {
        trl: phasesData.trl!.phase,
        mkrl: phasesData.mkrl!.phase,
        mfrl: phasesData.mfrl!.phase,
      }
    )
  }

  const storedCompletedOn = localStorage.getItem("completedOn")
  const completedOnDate = storedCompletedOn ? new Date(storedCompletedOn) : new Date()
  const completedOn = completedOnDate.toLocaleDateString(
    lang === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  )

  const projectName = localStorage.getItem("projectName") || undefined

  // Signature: read from scoped cache or fetch
  const SIGNATURE_STORAGE_KEY = "organization-signature"
  const organizationKey = getCookie("organization-key")
  let signatureUrl: string | undefined

  if (organizationKey) {
    try {
      const stored = localStorage.getItem(SIGNATURE_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as { organizationKey: string; url: string }
        if (parsed.organizationKey === organizationKey && parsed.url) {
          signatureUrl = parsed.url
        }
      }
    } catch {
      // ignore
    }
  }

  if (!signatureUrl && organizationKey) {
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/organizations/key/${organizationKey}`
      const res = await fetch(endpoint)
      if (res.ok) {
        const org = await res.json()
        if (org?.signature) {
          localStorage.setItem(
            SIGNATURE_STORAGE_KEY,
            JSON.stringify({ organizationKey, url: org.signature })
          )
          signatureUrl = org.signature
        }
      }
    } catch {
      // Signature is optional — continue without it
    }
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
