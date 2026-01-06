// Utils
import { cn } from "@/lib/utils"

export interface NotFoundProps {
  title: string
  description: string
}

interface ExtraProps {
  className?: string
}

const NotFound = ({ title, description, className }: NotFoundProps & ExtraProps) => {
  return (
    <div className={cn("w-full flex flex-col items-center justify-center flex-1 lg:box-content px-4", className)}>
      <h2 className="text-8xl font-light text-accent mb-8">404</h2>
      <h1 className="text-5xl font-bold mb-3">{title}</h1>
      <p className="text-lg text-muted-foreground text-center">{description}</p>
    </div>
  )
}

export default NotFound