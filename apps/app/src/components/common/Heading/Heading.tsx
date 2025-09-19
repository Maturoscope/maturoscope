// Utils
import { cn } from "@/lib/utils"

export interface HeadingProps {
  title: string
  description?: string
  tagline?: string
  className?: string
}

const Heading = ({ title, description, tagline, className }: HeadingProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-start w-full gap-5",
        className
      )}
    >
      {tagline && (
        <span className="text-sm font-medium text-muted-foreground">
          {tagline}
        </span>
      )}
      <h1 className="text-4xl font-bold">{title}</h1>
      {description && (
        <p className="text-base text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export default Heading
