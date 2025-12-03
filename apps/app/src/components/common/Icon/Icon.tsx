import { cn } from "@/lib/utils"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export const Icon = ({ className, ...props }: IconProps) => {
  return (
    <svg
      className={cn("shrink-0", className)}
      fill="none"
      {...props}
    />
  )
}

