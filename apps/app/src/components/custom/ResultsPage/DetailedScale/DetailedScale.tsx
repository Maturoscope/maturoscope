// Packages
import { useParams } from "next/navigation"
import { CircularProgressbarWithChildren } from "react-circular-progressbar"
// Utils
import { cn } from "@/lib/utils"
// Types
import { Gap } from "@/actions/organization"
// Types
import { Locale } from "@/dictionaries/dictionaries"

interface DetailedScaleProps {
  title: string
  level: number
  copyPreLevel: string
  copyPostLevel: string
  serviceLabel: string
  comingSoonLabel: string
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
  serviceLabel,
  gaps,
  className,
}: DetailedScaleProps & ExtraProps) => {
  const { lang } = useParams<{ lang: Locale }>()
  console.log({ lang })

  return (
    <div
      className={cn(
        "w-full flex flex-col md:flex-row gap-3.5 md:gap-6",
        className
      )}
    >
      <div className="w-full flex flex-col gap-6 md:max-w-[240px] py-4 px-5 md:p-6 rounded-3xl bg-white">
        <div className="flex flex-col gap-3 items-center">
          <h3 className="text-xl font-semibold w-max">{title}</h3>
          <div className="w-[75px] h-auto aspect-square lg:w-[120px]">
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
                <span className="text-5xl font-medium text-center leading-[0.88]">
                  {level}
                </span>
              </div>
            </CircularProgressbarWithChildren>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2.5 p-6 rounded-3xl bg-white">
        <span className="font-semibold text-xl">
          {copyPreLevel} {level + 1}: {copyPostLevel}
        </span>
        <div></div>
      </div>
    </div>
  )
}

export default DetailedScale
