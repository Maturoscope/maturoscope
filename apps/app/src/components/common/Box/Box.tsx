// Utils
import { cn } from "@/lib/utils"

interface BoxProps {
  children: React.ReactNode
  className?: string
}

const Box = ({ children, className }: BoxProps) => {
  return (
    <div className={cn("w-full p-12 border rounded-lg shadow-sm", className)}>
      {children}
    </div>
  )
}

export default Box
