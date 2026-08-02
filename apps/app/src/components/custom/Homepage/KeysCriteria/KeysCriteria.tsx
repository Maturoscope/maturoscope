// Components
import Box from "@/components/common/Box/Box"
import { getIconComponent } from "@/components/icons/iconMap"
// Types
import { ListItem } from "@/types/list-item"

export interface KeysCriteriaProps {
  title: string
  keys: ListItem[]
  /** Base delay (seconds) for the reveal cascade of this column. */
  revealDelay?: number
}

const KeysCriteria = ({ title, keys, revealDelay = 0 }: KeysCriteriaProps) => {
  return (
    <div className="flex flex-col items-start justify-start w-full lg:max-w-[584px] gap-5">
      <span
        className="reveal text-sm font-semibold text-foreground uppercase"
        style={{ "--reveal-delay": `${revealDelay}s` } as React.CSSProperties}
      >
        {title}
      </span>
      <ul className="flex flex-col items-start justify-start w-full gap-3">
        {keys.map((key, index) => {
          const IconComponent = getIconComponent(key.icon)

          return (
            <Box key={key.icon}>
              <li
                className="reveal flex items-start justify-start w-full gap-4 lg:flex-row flex-col"
                style={
                  {
                    "--reveal-delay": `${revealDelay + 0.1 + index * 0.08}s`,
                  } as React.CSSProperties
                }
              >
                <div className="flex items-center justify-center aspect-square w-10 h-10 rounded-md bg-neutral-50 border border-border">
                  {IconComponent ?
                    <IconComponent accent className="w-5 h-5" />
                  : <span className="text-xs text-muted-foreground">?</span>}
                </div>
                <div className="flex flex-col items-start justify-start gap-1">
                  <span className="text-lg lg:text-xl font-semibold text-foreground">
                    {key.title}
                  </span>
                  <span className="text-base text-muted-foreground">
                    {key.description}
                  </span>
                  {key.questionsCount && (
                    <span className="text-sm text-muted-foreground">
                      {key.questionsCount}
                    </span>
                  )}
                </div>
              </li>
            </Box>
          )
        })}
      </ul>
    </div>
  )
}

export default KeysCriteria
