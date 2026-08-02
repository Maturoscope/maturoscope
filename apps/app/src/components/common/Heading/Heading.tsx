// Utils
import { cn } from "@/lib/utils"

export interface HeadingProps {
  title: string
  description?: string
  tagline?: string
  className?: string
  /**
   * When true, the tagline/title/description reveal in a subtle staggered
   * cascade (CSS-driven, so it stays smooth on mobile during hydration).
   */
  animated?: boolean
  /** Base delay (seconds) for the reveal cascade of the animated variant. */
  revealDelay?: number
}

const Heading = ({
  title,
  description,
  tagline,
  className,
  animated = false,
  revealDelay = 0,
}: HeadingProps) => {
  const containerClassName = cn(
    "flex flex-col items-start justify-start w-full gap-4",
    className
  )

  if (!animated) {
    return (
      <div className={containerClassName}>
        {tagline && (
          <span className="text-sm font-medium text-muted-foreground">
            {tagline}
          </span>
        )}
        <h1 className="text-4xl lg:text-5xl font-semibold">{title}</h1>
        {description && (
          <p className="text-base text-muted-foreground whitespace-pre-line">
            {description}
          </p>
        )}
      </div>
    )
  }

  const delayStyle = (offset: number) =>
    ({ "--reveal-delay": `${revealDelay + offset}s` }) as React.CSSProperties

  return (
    <div className={containerClassName}>
      {tagline && (
        <span
          className="reveal text-sm font-medium text-muted-foreground"
          style={delayStyle(0)}
        >
          {tagline}
        </span>
      )}
      <h1
        className="reveal text-4xl lg:text-5xl font-semibold"
        style={delayStyle(0.08)}
      >
        {title}
      </h1>
      {description && (
        <p
          className="reveal text-base text-muted-foreground whitespace-pre-line"
          style={delayStyle(0.16)}
        >
          {description}
        </p>
      )}
    </div>
  )
}

export default Heading
