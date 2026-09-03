"use client"

// Packages
import { AnimatePresence, motion } from "motion/react"
import { Box, CodeXml, Users, Info, Check } from "lucide-react"
// Utils
import { cn } from "@/lib/utils"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
import {
  EvaluationType,
  EVALUATION_TYPES,
  RECOMMENDED_BY_TYPE,
} from "@/lib/evaluation"
import { ALL_SCALES } from "@/lib/selectedScales"

export interface EvaluationDict {
  title: string
  description: string
  availableDimensionsTitle: string
  availableDimensionsDescription: string
  recommendedLabel: string
  disclaimer: string
  types: Record<EvaluationType, { label: string; description: string }>
  dimensions: Record<StageId, string>
}

interface EvaluationSelectorProps {
  dict: EvaluationDict
  evaluationType: EvaluationType | null
  selectedScales: StageId[]
  onSelectType: (type: EvaluationType) => void
  onToggleScale: (scale: StageId) => void
}

const TYPE_ICONS: Record<EvaluationType, React.ReactNode> = {
  product: <Box className="w-4 h-4" />,
  software: <CodeXml className="w-4 h-4" />,
  service: <Users className="w-4 h-4" />,
}

// Smooth height+fade for the expanding dimensions and the disclaimer.
const EXPAND = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto" as const, opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
}

const EvaluationSelector = ({
  dict,
  evaluationType,
  selectedScales,
  onSelectType,
  onToggleScale,
}: EvaluationSelectorProps) => {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-foreground">{dict.title}</p>
        <p className="text-sm text-muted-foreground">{dict.description}</p>
      </div>

      <div className="flex flex-col gap-2">
        {EVALUATION_TYPES.map((type) => {
          const isSelected = evaluationType === type
          const recommended = RECOMMENDED_BY_TYPE[type]
          const hasNonRecommended =
            isSelected &&
            selectedScales.some((scale) => !recommended.includes(scale))

          return (
            <div
              key={type}
              className={cn(
                "rounded-md border bg-white transition-colors",
                isSelected
                  ? "border-accent ring-1 ring-accent"
                  : "border-input hover:border-muted-foreground/40"
              )}
            >
              {/* Type header (radio) */}
              <button
                type="button"
                onClick={() => onSelectType(type)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "shrink-0",
                      isSelected ? "text-accent" : "text-[#0A0A0A]"
                    )}
                  >
                    {TYPE_ICONS[type]}
                  </span>
                  <span className="text-sm truncate">
                    <span className="font-semibold text-[#0A0A0A]">
                      {dict.types[type].label}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      — {dict.types[type].description}
                    </span>
                  </span>
                </div>
                <span
                  className={cn(
                    "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center",
                    isSelected ? "border-accent" : "border-input"
                  )}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-accent" />
                  )}
                </span>
              </button>

              {/* Expanded dimensions */}
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.div
                    key="dimensions"
                    {...EXPAND}
                    className="overflow-hidden"
                  >
                    <div className="w-full h-px bg-border" />
                    <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
                      <div className="flex flex-col gap-0.5 pl-6">
                        <span className="text-sm font-medium text-foreground">
                          {dict.availableDimensionsTitle}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {dict.availableDimensionsDescription}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 pl-6">
                        {ALL_SCALES.map((scale) => {
                          const checked = selectedScales.includes(scale)
                          const isRecommended = recommended.includes(scale)
                          return (
                            <button
                              key={scale}
                              type="button"
                              onClick={() => onToggleScale(scale)}
                              className="flex items-center justify-between gap-3 text-left cursor-pointer"
                            >
                              <span className="flex items-center gap-2.5">
                                <span
                                  className={cn(
                                    "w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors",
                                    checked
                                      ? "bg-accent border-accent text-white"
                                      : "border-input"
                                  )}
                                >
                                  {checked && (
                                    <Check className="w-3 h-3" strokeWidth={3} />
                                  )}
                                </span>
                                <span className="text-sm text-foreground">
                                  {dict.dimensions[scale]}
                                </span>
                              </span>
                              {isRecommended && (
                                <span className="shrink-0 rounded-md bg-[#F0FDFA] px-2 py-0.5 text-xs font-medium text-[#0D9488]">
                                  {dict.recommendedLabel}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Disclaimer for non-recommended scales */}
                      <AnimatePresence initial={false}>
                        {hasNonRecommended && (
                          <motion.div
                            key="disclaimer"
                            {...EXPAND}
                            className="overflow-hidden pl-6"
                          >
                            <div className="flex items-start gap-2 rounded-md bg-neutral-50 border border-border px-3 py-2.5">
                              <Info className="w-4 h-4 shrink-0 mt-px text-[#0A0A0A]" />
                              <span className="text-xs text-[#0A0A0A]">
                                {dict.disclaimer}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EvaluationSelector
