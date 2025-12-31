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
  comingSoonLabel: string
  focusLabel: string
  primaryRiskLabel: string
  strategicFocus?: LocalizedText
  primaryRisk?: LocalizedText
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

const INDEX_COLOR_TO_KEY: Record<string, string> = {
  trl: "bg-orange-50",
  mkrl: "bg-teal-50",
  mfrl: "bg-blue-50",
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
  comingSoonLabel,
  focusLabel,
  primaryRiskLabel,
  strategicFocus,
  primaryRisk,
  gaps,
  className,
}: DetailedScaleProps & ExtraProps) => {
  const { lang } = useParams<{ lang: Locale }>()
  const levelSummary = level === 9 ? `${copyLevelLabel} ${level}: ${copyHighestLevel}` : `${copyPreLevel} ${level + 1}: ${copyPostLevel}`

  return (
    <div
      className={cn(
        "w-full flex flex-col lg:flex-row gap-3.5 md:gap-6",
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
                  {level}
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
        <span className="font-semibold text-base lg:text-xl">
          {levelSummary}
        </span>
        <div className="flex flex-col">
          {gaps.map((gap, index) => (
            <ServiceAccordion
              key={gap.questionId}
              index={index}
              title={gap.gapDescription[lang]}
              serviceLabel={serviceLabel}
              comingSoonLabel={comingSoonLabel}
              recommendedServices={gap.recommendedServices}
              hasServices={gap.hasServices}
              indexColor={INDEX_COLOR_TO_KEY[id]}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default DetailedScale
