"use client"

// Packages
import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
// Components
import Modal from "@/components/common/Modal/Modal"
import { Button } from "@/components/ui/button"
// Types
import { Gap } from "@/actions/organization"
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { Locale } from "@/dictionaries/dictionaries"

export interface SupportNeededProps {
  title: string
  description: string
  primaryButtonLabel: string
  completedLabel: string
  chipLabel: string
}

interface ExtraProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

interface GapsStorage {
  trl?: Gap[]
  mkrl?: Gap[]
  mfrl?: Gap[]
}

interface LevelStorage {
  trl?: number
  mkrl?: number
  mfrl?: number
}

type StageGapsItem = { trl: Gap[] } | { mkrl: Gap[] } | { mfrl: Gap[] }

const SupportNeeded = ({
  title,
  description,
  primaryButtonLabel,
  completedLabel,
  chipLabel,
  isOpen,
  setIsOpen,
}: SupportNeededProps & ExtraProps) => {
  const [orderedGaps, setOrderedGaps] = useState<StageGapsItem[]>([])
  const { lang } = useParams<{ lang: Locale }>()

  useEffect(() => {
    const storedGaps = localStorage.getItem("gaps")
    const storedLevel = localStorage.getItem("level")

    if (!storedGaps) return

    const gapsData: GapsStorage = JSON.parse(storedGaps)
    const levelData: LevelStorage = storedLevel ? JSON.parse(storedLevel) : {}

    const sortByLevel = (gaps: Gap[]) =>
      [...gaps].sort((a, b) => a.level - b.level)

    const stageIds: StageId[] = ["trl", "mkrl", "mfrl"]

    const stagesWithAvgLevel = stageIds.map((stageId) => {
      const stageGaps = gapsData[stageId] ?? []
      const stageLevel = levelData[stageId] ?? 0
      return { stageId, gaps: stageGaps, stageLevel }
    })

    stagesWithAvgLevel.sort((a, b) => a.stageLevel - b.stageLevel)

    const result: StageGapsItem[] = stagesWithAvgLevel.map(
      ({ stageId, gaps }) => {
        const sortedGaps = sortByLevel(gaps)
        return { [stageId]: sortedGaps } as StageGapsItem
      }
    )

    setOrderedGaps(result)
  }, [])

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className="p-6 flex flex-col gap-4 max-w-[740px] w-full"
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-base font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="h-1 w-20 aspect-20/1 relative bg-neutral-100 rounded-full after:content-[''] after:absolute after:left-0 after:top-0 after:h-full after:w-1/2 after:bg-primary after:rounded-full" />
            <span className="text-sm text-muted-foreground">
              1/2 {completedLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="bg-border w-px h-3.5" />
            <div className="cursor-pointer size-8 flex items-center justify-center">
              <Image
                src="/icons/common/cross.svg"
                alt="Close"
                width={16}
                height={16}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 max-h-[700px] overflow-y-auto">
        {orderedGaps.map((scale, index) => {
          const scaleName = Object.keys(scale)[0] as StageId
          const gaps = scale[scaleName as keyof StageGapsItem] as Gap[]

          return (
            <div key={index}>
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                <h3 className="text-sm font-medium uppercase w-full">
                  {scaleName}
                </h3>
                {index === 0 && (
                  <div className="bg-[#0D9488] py-0.5 px-2 rounded-md text-xs font-semibold text-white shrink-0">
                    {chipLabel}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-3">
                {gaps.map((gap) => (
                  <label
                    key={gap.questionId}
                    className="flex items-start gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="peer appearance-none absolute outline-none"
                    />
                    <Image
                      src="/icons/common/checkbox-unchecked.svg"
                      alt="Checkbox"
                      width={16}
                      height={16}
                      className="peer-checked:hidden mt-0.5"
                    />
                    <Image
                      src="/icons/common/checkbox-checked.svg"
                      alt="Checkbox"
                      width={16}
                      height={16}
                      className="hidden peer-checked:block mt-0.5"
                    />
                    <h4 className="text-sm font-medium">
                      {gap.gapDescription[lang]}
                    </h4>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button variant="default" accent>
          {primaryButtonLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default SupportNeeded
