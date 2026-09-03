// Packages
import { useParams } from "next/navigation"
import { CircularProgressbarWithChildren } from "react-circular-progressbar"
// Utils
import { cn } from "@/lib/utils"
// Types
import { Gap, LocalizedText } from "@/actions/organization"
import { Locale } from "@/dictionaries/dictionaries"
// Components
import ServiceAccordion from "@/components/custom/ResultsPage/ServiceAccordion/ServiceAccordion"

interface DetailedScaleProps {
  title: string
  level: number
  copyPreLevel: string
  copyPostLevel: string
  copyHighestLevel: string
  copyLevelLabel: string
  serviceLabel: string
  servicesLabel: string
  comingSoonLabel: string
  gapLabel: string
  servicesColumnLabel: string
  descriptionColumnLabel: string
  focusLabel: string
  primaryRiskLabel: string
  noScoreTitle: string
  noScoreDescription: string
  strategicFocus?: LocalizedText
  primaryRisk?: LocalizedText
  notScored?: boolean
  gaps: Gap[]
}

interface ExtraProps {
  id: string
  className?: string
}

const COLOR_TO_KEY: Record<string, string> = {
  trl: "#EA580C",
  mkrl: "#0D9488",
  mfrl: "#2563EB",
}

const DetailedScale = ({
  id,
  title,
  level,
  copyPreLevel,
  copyPostLevel,
  copyHighestLevel,
  copyLevelLabel,
  serviceLabel,
  servicesLabel,
  comingSoonLabel,
  gapLabel,
  servicesColumnLabel,
  descriptionColumnLabel,
  focusLabel,
  primaryRiskLabel,
  noScoreTitle,
  noScoreDescription,
  strategicFocus,
  primaryRisk,
  notScored = false,
  gaps,
  className,
}: DetailedScaleProps & ExtraProps) => {
  const { lang } = useParams<{ lang: Locale }>()
  const levelSummary = level === 9 ? `${copyLevelLabel} ${level}: ${copyHighestLevel}` : `${copyPreLevel} ${level + 1}: ${copyPostLevel}`
  // "No {scale} score" copy for the fully-N/A case.
  const scoreTitle = noScoreTitle.replace("{scale}", title)
  const scoreDescription = noScoreDescription.replace("{scale}", title)

  return (
    <div
      id={`scale-${id}`}
      className={cn(
        "w-full flex flex-col lg:flex-row gap-3.5 md:gap-6 scroll-mt-52 md:scroll-mt-36 lg:scroll-mt-40",
        className
      )}
    >
      <div className="w-full flex lg:flex-col gap-6 lg:gap-5 lg:max-w-[240px] py-4 px-5 lg:p-6 rounded-3xl bg-white h-min">
        <div className="flex flex-col gap-3 items-center">
          <h3 className="text-xl font-semibold w-max">{title}</h3>
          <div className="w-[75px] h-auto aspect-square lg:w-[120px] mb-1">
            <CircularProgressbarWithChildren
              strokeWidth={6}
              value={level}
              maxValue={9}
              styles={{
                path: {
                  stroke: COLOR_TO_KEY[id],
                },
                trail: {
                  stroke: "#F5F5F5",
                },
              }}
            >
              <div className="flex items-end">
                <span className="text-3xl lg:text-5xl font-medium text-center leading-[0.88]">
                  {notScored ? "-" : level}
                </span>
              </div>
            </CircularProgressbarWithChildren>
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full">
          <div className="flex flex-col">
            <div className="mb-5 w-full h-px bg-border hidden lg:block" />
            <span className="text-sm text-muted-foreground">{focusLabel}</span>
            <span className="text-sm font-medium">
              {strategicFocus?.[lang] ?? "-"}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="mb-5 w-full h-px bg-border" />
            <span className="text-sm text-muted-foreground">
              {primaryRiskLabel}
            </span>
            <span className="text-sm font-medium">
              {primaryRisk?.[lang] ?? "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2.5 p-6 rounded-3xl bg-white h-min">
        {notScored ? (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-base">{scoreTitle}</span>
            <span className="text-sm text-muted-foreground">
              {scoreDescription}
            </span>
          </div>
        ) : (
          <>
            <span className="font-semibold text-base">{levelSummary}</span>
            <div className="flex flex-col">
              {gaps.map((gap, index) => (
                <ServiceAccordion
                  key={gap.questionId}
                  index={index}
                  gapLabel={gapLabel}
                  title={gap.gapDescription[lang]}
                  serviceLabel={serviceLabel}
                  servicesLabel={servicesLabel}
                  comingSoonLabel={comingSoonLabel}
                  servicesColumnLabel={servicesColumnLabel}
                  descriptionColumnLabel={descriptionColumnLabel}
                  recommendedServices={gap.recommendedServices}
                  hasServices={gap.hasServices}
                  lang={lang}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DetailedScale
