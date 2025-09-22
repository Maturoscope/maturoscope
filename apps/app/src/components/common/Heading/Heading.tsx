// Utils
import { cn } from "@/lib/utils"

export interface HeadingProps {
  title: string
  secondTitle?: string
  description?: string
  tagline?: string
  className?: string
}

const Heading = ({
  title,
  secondTitle,
  description,
  tagline,
  className,
}: HeadingProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-start w-full gap-4 lg:gap-5",
        className
      )}
    >
      {tagline && (
        <span className="text-sm font-medium text-muted-foreground">
          {tagline}
        </span>
      )}
      <h1 className="text-3xl lg:text-4xl font-bold">{title}</h1>
      {secondTitle && <h2 className="text-xl font-semibold">{secondTitle}</h2>}
      {description && (
        <p className="text-base text-muted-foreground whitespace-pre-line">
          {description}
        </p>
      )}
    </div>
  )
}

export default Heading
