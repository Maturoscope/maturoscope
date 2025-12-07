"use client"

// Styles
import "swiper/css"
// Packages
import { useState, useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
// Utils
import { cn } from "@/lib/utils"
// Icons
import {
  ArrowNextIcon,
  CriteriaMfrlIcon,
  CriteriaMkrlIcon,
  CriteriaTrlIcon,
} from "@/components/icons"
// Components
import { Button } from "@/components/ui/button"
import OverviewCard from "@/components/custom/ResultsPage/OverviewCard/OverviewCard"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { DevelopmentPhase } from "@/actions/organization"

export interface OverviewProps {
  title: string
  stages: {
    label: string
    description: string
  }[]
  learnMoreButtonLabel: string
  resultsSufixLabel: string
}

interface ExtraProps {
  className?: string
}

interface LevelStorage {
  trl?: number
  mkrl?: number
  mfrl?: number
}

interface PhasesStorage {
  trl?: DevelopmentPhase
  mkrl?: DevelopmentPhase
  mfrl?: DevelopmentPhase
}

const LABEL_TO_KEY: Record<string, StageId> = {
  TRL: "trl",
  MkRL: "mkrl",
  MfRL: "mfrl",
}

const ICON_TO_KEY: Record<string, React.ReactNode> = {
  TRL: <CriteriaTrlIcon width={16} height={16} />,
  MkRL: <CriteriaMkrlIcon width={16} height={16} />,
  MfRL: <CriteriaMfrlIcon width={16} height={16} />,
}

const Overview = ({
  title,
  learnMoreButtonLabel,
  resultsSufixLabel,
  stages,
  className,
}: OverviewProps & ExtraProps) => {
  const swiperRef = useRef<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [levelData, setLevelData] = useState<LevelStorage>({})
  const [phasesData, setPhasesData] = useState<PhasesStorage>({})

  const formattedStages = stages.map((stage) => {
    const stageKey = LABEL_TO_KEY[stage.label]
    const icon = ICON_TO_KEY[stage.label]
    const value = levelData[stageKey] ?? 0
    const maxValue = 9
    const phase = phasesData[stageKey] as DevelopmentPhase

    return {
      ...stage,
      value,
      maxValue,
      learnMoreButtonLabel,
      resultsSufixLabel,
      icon,
      phase,
    }
  })

  useEffect(() => {
    const storedLevel = localStorage.getItem("level")
    const storedPhases = localStorage.getItem("phases")

    if (storedLevel) setLevelData(JSON.parse(storedLevel))
    if (storedPhases) setPhasesData(JSON.parse(storedPhases))
  }, [])

  const isBackButtonDisabled = activeIndex === 0
  const isNextButtonDisabled = activeIndex === stages.length - 1

  const handleNextSlide = () => swiperRef.current?.slideNext()
  const handlePrevSlide = () => swiperRef.current?.slidePrev()

  return (
    <div className={cn("flex flex-col w-full  mt-3 lg:mt-8", className)}>
      <div className="w-full flex justify-between items-center px-4 lg:px-6">
        <h1 className="text-2xl font-medium">{title}</h1>
        <div className="flex md:hidden gap-2.5">
          <Button
            variant="outline"
            className="px-2"
            onClick={handlePrevSlide}
            disabled={isBackButtonDisabled}
          >
            <ArrowNextIcon className="rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="px-2"
            onClick={handleNextSlide}
            disabled={isNextButtonDisabled}
          >
            <ArrowNextIcon />
          </Button>
        </div>
      </div>

      <div className="w-full gap-6 mt-4 hidden lg:flex px-4 lg:px-6">
        {formattedStages.map((stage) => (
          <OverviewCard key={stage.label} {...stage} />
        ))}
      </div>

      <div className="w-full mt-4 lg:hidden flex flex-col gap-4 items-center">
        <div className="block w-full">
          <Swiper
            id="swiper-overview"
            slidesPerView={1.1}
            spaceBetween={12}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            centeredSlides
          >
            {formattedStages.map((stage) => (
              <SwiperSlide key={stage.label}>
                <OverviewCard {...stage} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="flex gap-1.5">
          {stages.map((stage, index) => (
            <div
              key={stage.label}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                activeIndex === index ? "bg-accent w-6" : "bg-[#A3A3A3]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Overview
